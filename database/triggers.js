/**
 * Database Triggers (Mongoose Middleware Mapping) Reference File
 * 
 * In MongoDB, database triggers are implemented as pre and post hooks 
 * on Mongoose models or as application-level services. This file outlines 
 * the exact trigger hooks registered in the models.
 */

const matchingService = require('../server/services/matchingService');

module.exports = {
  /**
   * Trigger 1: Triggered when a new Complaint or StolenItem is saved.
   * Auto-calculates suspect match scores.
   */
  async postComplaintSave(complaintDoc) {
    console.log(`[Trigger] New complaint registered: ${complaintDoc.complaintNumber}. Running suspect matcher...`);
    try {
      await matchingService.runMatchingForComplaint(complaintDoc);
      console.log(`[Trigger] Matching completed for complaint ${complaintDoc._id}`);
    } catch (err) {
      console.error(`[Trigger Error] Failed to run matcher for complaint:`, err);
    }
  },

  /**
   * Trigger 2: Triggered when StolenItem status is updated.
   * Updates recovery timestamp and checks if parent complaint should resolve.
   */
  async postStolenItemSave(itemDoc) {
    if (itemDoc.status === 'recovered') {
      console.log(`[Trigger] Item ${itemDoc.itemName} recovered. Updating parent complaint status...`);
      try {
        const StolenItem = itemDoc.constructor;
        const Complaint = itemDoc.db.model('Complaint');

        // Check if all items in this complaint have been recovered
        const remainingStolen = await StolenItem.countDocuments({
          complaintId: itemDoc.complaintId,
          status: 'stolen'
        });

        if (remainingStolen === 0) {
          console.log(`[Trigger] All items for complaint ${itemDoc.complaintId} recovered. Resolving complaint.`);
          await Complaint.findByIdAndUpdate(itemDoc.complaintId, { status: 'resolved' });
        }
      } catch (err) {
        console.error(`[Trigger Error] Failed to update parent complaint status:`, err);
      }
    }
  }
};
