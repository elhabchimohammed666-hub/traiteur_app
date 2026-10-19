const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed },
  ip: String,
  userAgent: String
}, { timestamps: true });

auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
