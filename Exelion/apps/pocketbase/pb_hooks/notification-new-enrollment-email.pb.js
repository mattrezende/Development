/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  try {
    // Fetch related student record
    const student = $app.findRecordById("students", e.record.get("student_id"));
    const studentName = student.get("name");
    const studentEmail = student.get("email");
    const studentPhone = student.get("phone");

    // Fetch related schedule record
    const schedule = $app.findRecordById("schedules", e.record.get("schedule_id"));
    const dayOfWeek = schedule.get("day_of_week");
    const startTime = schedule.get("start_time");
    const endTime = schedule.get("end_time");

    // Fetch related teacher record
    const teacher = $app.findRecordById("teachers", e.record.get("teacher_id"));
    const teacherEmail = teacher.get("email");
    const teacherName = teacher.get("name");

    // Prepare email content
    const subject = "Nova Inscrição - " + studentName;
    
    let emailBody = "<h2>Olá, " + teacherName + "!</h2>";
    emailBody += "<p>Você tem uma nova inscrição:</p>";
    emailBody += "<ul>";
    emailBody += "<li><strong>Aluno:</strong> " + studentName + "</li>";
    emailBody += "<li><strong>Email:</strong> " + (studentEmail || "Não informado") + "</li>";
    if (studentPhone) {
      emailBody += "<li><strong>Telefone:</strong> " + studentPhone + "</li>";
    }
    emailBody += "<li><strong>Aula:</strong> " + dayOfWeek + " de " + startTime + " a " + endTime + "</li>";
    emailBody += "</ul>";
    emailBody += "<p>Atenciosamente,<br>Sistema de Agendamento</p>";

    // Send email
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: teacherEmail }],
      subject: subject,
      html: emailBody
    });

    $app.newMailClient().send(message);
    console.log("Enrollment notification email sent successfully to " + teacherEmail + " for student " + studentName);
  } catch (error) {
    console.error("Failed to send enrollment notification email: " + error.message);
  }

  e.next();
}, "enrollments");