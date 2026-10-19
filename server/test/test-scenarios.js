const http = require('http');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

async function runTests() {
  console.log('=== Démarrage des Tests de Recette Elhabchi Traiteur ===');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;
  console.log(`Serveur de test actif sur : ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  async function req(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await req('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Health Check API');

    // 2. Fetch Packages & Dishes
    const pkgs = await req('/packages');
    assert(pkgs.status === 200 && pkgs.data.data.length > 0, 'Récupération des formules actives');
    const prestigePkg = pkgs.data.data.find(p => p.slug === 'formule-prestige-imperiale');

    const dishesRes = await req('/dishes');
    assert(dishesRes.status === 200 && dishesRes.data.data.length > 0, 'Récupération des plats du menu');

    const equipRes = await req('/equipment');
    assert(equipRes.status === 200 && equipRes.data.data.length > 0, 'Récupération du matériel de réception');
    const chair = equipRes.data.data.find(e => e.name.includes('Chaise'));

    // 3. Scénario R1 : Estimation d'un mariage de 250 invités
    const estimatePayload = {
      packageId: prestigePkg._id,
      event: { type: 'mariage', guestsCount: 250, city: 'Casablanca' },
      equipmentItems: chair ? [{ equipment: chair._id, quantity: 250, unitPrice: 25, days: 1 }] : []
    };
    const estimate = await req('/bookings/estimate', { method: 'POST', body: estimatePayload });
    assert(estimate.status === 200 && estimate.data.data.pricing.total > 100000, 'R1: Estimation calculée avec formule et matériel');

    // 4. Scénario R2 : Envoi demande simulateur, code de suivi et lien WhatsApp
    const futureDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const bookingPayload = {
      customer: { fullName: 'Salma El Fassi', phone: '+212612345678', email: 'salma@test.com' },
      event: { type: 'mariage', date: futureDate, guestsCount: 200, city: 'Casablanca' },
      package: prestigePkg._id,
      equipmentItems: chair ? [{ equipment: chair._id, quantity: 200 }] : [],
      consent: true
    };
    const createRes = await req('/bookings/public', { method: 'POST', body: bookingPayload });
    assert(
      createRes.status === 201 &&
      createRes.data.data.trackingCode.startsWith('ELH-') &&
      createRes.data.data.whatsappUrl.includes('wa.me/212705782737'),
      'R2: Demande enregistrée avec code ELH-AAAA-NNNNN et lien wa.me/212705782737'
    );
    const trackingCode = createRes.data.data.trackingCode;

    // 5. Scénario R7 : Suivi avec téléphone
    const trackOk = await req(`/bookings/track?code=${trackingCode}&phone=+212612345678`);
    assert(trackOk.status === 200 && trackOk.data.data.trackingCode === trackingCode, 'R7: Suivi réussi avec téléphone valide');

    const trackBadPhone = await req(`/bookings/track?code=${trackingCode}&phone=+212699999999`);
    assert(trackBadPhone.status === 403, 'R7: Suivi refusé avec mauvais téléphone (403)');

    // 6. Scénario R6 : Annulation par le client
    const cancelRes = await req(`/bookings/track/${trackingCode}/respond`, {
      method: 'PATCH',
      body: { action: 'cancel', phone: '+212612345678', note: 'Changement de date de mariage' }
    });
    assert(cancelRes.status === 200 && cancelRes.data.data.status === 'cancelled', 'R6: Annulation client avec motif enregistré');

    // 7. Scénario R8 : Authentification & RBAC
    const loginAdmin = await req('/auth/login', {
      method: 'POST',
      body: { email: 'admin@elhabchitraiteur.ma', password: 'Admin1234!' }
    });
    assert(loginAdmin.status === 200 && loginAdmin.data.data.user.role === 'admin', 'Connexion Admin réussie');
    const adminToken = loginAdmin.data.data.accessToken;

    const loginStaff = await req('/auth/login', {
      method: 'POST',
      body: { email: 'staff@elhabchitraiteur.ma', password: 'Staff1234!' }
    });
    assert(loginStaff.status === 200 && loginStaff.data.data.user.role === 'staff', 'Connexion Staff réussie');
    const staffToken = loginStaff.data.data.accessToken;

    // Staff tries to access /users (reserved to admin) -> should get 403
    const staffUsersCheck = await req('/users', { headers: { Authorization: `Bearer ${staffToken}` } });
    assert(staffUsersCheck.status === 403, 'R8: Staff refusé sur /users (403)');

    // Admin accesses /users -> should get 200
    const adminUsersCheck = await req('/users', { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(adminUsersCheck.status === 200 && adminUsersCheck.data.data.length > 0, 'R8: Admin autorisé sur /users (200)');

    // 8. Test Dashboard Stats
    const statsRes = await req('/dashboard/stats', { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(statsRes.status === 200 && statsRes.data.data.kpi.totalBookings >= 1, 'Dashboard KPIs calculés');

  } catch (err) {
    console.error('Erreur durant les tests :', err);
    failed++;
  } finally {
    server.close();
    await mongoose.connection.close();
    console.log(`\n=== Résultat : ${passed} passés, ${failed} échoués ===`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
