import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /schedules/migrate-schedules
 * Migrates schedules with teacher names to teacher IDs
 */
router.post('/migrate-schedules', async (req, res) => {
  const fixed = [];
  const failed = [];
  const errors = [];

  // Fetch all schedules
  const schedules = await pb.collection('schedules').getFullList();

  logger.info(`Starting migration for ${schedules.length} schedules`);

  // Fetch all teachers for lookup
  const teachers = await pb.collection('teachers').getFullList();
  const teacherMap = new Map();
  teachers.forEach((teacher) => {
    teacherMap.set(teacher.name, teacher.id);
  });

  logger.info(`Loaded ${teachers.length} teachers for lookup`);

  // Process each schedule
  for (const schedule of schedules) {
    const teacherId = schedule.teacher_id;

    // Check if teacher_id is already a valid ID format (15 chars alphanumeric)
    const isValidIdFormat = /^[a-z0-9]{15}$/.test(teacherId);

    if (isValidIdFormat) {
      // Already a valid ID, skip
      logger.info(`Schedule ${schedule.id} already has valid teacher ID: ${teacherId}`);
      fixed.push(schedule.id);
      continue;
    }

    // teacher_id is a name string, look up the correct ID
    const correctTeacherId = teacherMap.get(teacherId);

    if (!correctTeacherId) {
      const errorMsg = `Teacher not found for schedule ${schedule.id} with name: ${teacherId}`;
      logger.error(errorMsg);
      errors.push(errorMsg);
      failed.push(schedule.id);
      continue;
    }

    // Update schedule with correct teacher ID
    await pb.collection('schedules').update(schedule.id, {
      teacher_id: correctTeacherId,
    });

    logger.info(
      `Schedule ${schedule.id} updated: ${teacherId} -> ${correctTeacherId}`
    );
    fixed.push(schedule.id);
  }

  logger.info(
    `Migration complete: ${fixed.length} fixed, ${failed.length} failed`
  );

  res.json({
    success: true,
    fixed: fixed.length,
    failed: failed.length,
    errors,
  });
});

export default router;