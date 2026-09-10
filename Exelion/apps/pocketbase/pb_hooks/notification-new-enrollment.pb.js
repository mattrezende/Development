/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const teacherId = e.record.get("teacher_id");
  const studentId = e.record.get("student_id");
  const enrollmentId = e.record.id;
  
  const notification = new Record("notifications", {
    teacher_id: teacherId,
    type: "new_enrollment",
    title: "New Enrollment",
    message: "A new student has enrolled in your class",
    related_data: JSON.stringify({
      student_id: studentId,
      enrollment_id: enrollmentId
    }),
    read: false
  });
  
  $app.save(notification);
  e.next();
}, "enrollments");