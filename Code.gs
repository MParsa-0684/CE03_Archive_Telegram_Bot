function myFunction() {
}

function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  var sender_id = contents.message.from.id;
  updateUser(contents)
  checkCommand(contents)
  
}

function checkCommand(contents) {
  var text = contents.message.text;

  switch(text) {
    case "/start":
      initChat(contents);
      sendNullKeyboardOptions(contents);
      updateState(contents, null)
      break;
    
    case "/help":
      updateState(contents, null);
      sendHelp(contents);
      break;
    
    case "/set_student_number": 
      if (getStudentNumber(contents) != "") {
        sendMessage(contents.message.from.id, "شما قبلا شماره دانشجویی خود را ثبت کرده اید!")
      }
      else {
        updateState(contents, text);
        sendMessage(contents.message.from.id, "لطفا شماره دانشجویی خود را در قالب یک پیام با اعداد انگلیسی و بدون هیچ اطلاعات و فاصله اضافه ارسال نمایید! \n*** توجه:‌ بعد از تعیین شماره دانشجویی دیگر امکان تغییر آن را نخواهید داشت ***")
      }
      break;
    
    case "/week_program":
      updateState(contents, null);
      sendWeekProgram(contents)
      if (isAdmin(contents)) {
        updateState(contents, text);
        sendMessage(contents.message.from.id, "(مخصوص ادمین های بات) میتوانید به فرمت زیر به برنامه ددلاین اضافه کنید:\nروز هفته-متن ددلاین\nیا جهت حذف کامل برنامه هفتگی از دستور 'حذف' استفاده کنید.");
      }
      break;
    
    case "/courses_files":
      updateState(contents, text);
      sendCoursesTopics(contents, "courses_files");
      break;
    
    case "/courses_records":
      updateState(contents, text);
      sendCoursesTopics(contents, "courses_records");
      break;
    
    case "/send_file":
      if (!canSendFile) {
        sendMessage(contents.message.from.id, "این ویژگی درحال حاضر غیرفعال است!");
        return;
      }

      if (isBlackList(contents) != true) {
        updateState(contents, text);
        sendMessage(contents.message.from.id, "فایل جزوه خود را تنها با فرمت pdf همراه با نام درس جزوه مربوطه در یک پیام بفرستید.")
      }
      else {
        sendMessage(contents.message.from.id, "در حال حاضر شما امکان ارسال جزوه رو ندارید! لطفا با پشتیبانی در ارتباط")
      }
      break;

    case "/lunch_notifier":
      updateState(contents, null);
      foodNotifier(contents);
      break;

    case "/teacher_emails_links":
      updateState(contents, text);
      sendTeachersKeyboardOptions(contents);
      break;

    case "/online_courses_links":
      updateState(contents, text);
      sendTeachersKeyboardOptions(contents);
      break;
    
    case "/check_grades":
      if (!canCheckGrades) {
        sendMessage(contents.message.from.id, "این ویژگی درحال حاضر غیرفعال است!");
        return;
      }

      if (getStudentNumber(contents) != "") {
        updateState(contents, text);
        //TODO
      }
      else {
        sendMessage(contents.message.from.id, "شماره دانشجویی خود را در بخش /set_student_number ثبت کنید!");
      }
      
      break;
    
    case "/courses_files_archives":
      updateState(contents, text);
      sendCoursesTopics(contents, "courses_archives");
      break;
    
    default:
      checkBeforeCommand(contents);
      break;
  }
}

function checkBeforeCommand(contents) {
  var userStatus = getUserState(contents);
  var text = contents.message.text;
  var senderID = contents.message.from.id;

  switch(userStatus) {
    case "/teacher_emails_links":
      sendTeacherData(text, contents, 2);
      break;
    case "/online_courses_links":
      sendTeacherData(text, contents, 3);
      break;

    case "/week_program":
      if (text.trim() === "حذف") {
        deleteProgram(senderID);
      }
      else {
        addWeekProgram(text, contents);
      }
      break;
    
    case "/courses_files":
      if (getTopic(contents)) {
        if (contents.message && contents.message.forward_from_chat) {
          saveForwardedMessage(contents);
        } else {
          sendMessage(contents.message.from.id, "لطفاً یک پیام فوروارد شده از کانال ارسال کنید.");
        }
      }
      else {
        forwardCourseDatas(contents, "courses_files", text);
      }
      if (isAdmin(contents)) {
        sendMessage(senderID, "(مخصوص ادمین های بات) میتوانید پیام های کانال را فوردارد کنید تا به لیست درس اضافه شود یا با /start به منوی اصلی بروید!")
      }
      break;
    
    case "/courses_records":
      if (getTopic(contents)) {
        if (contents.message && contents.message.forward_from_chat) {
          saveForwardedMessage(contents);
          sendMessage(contents.message.from.id, "✅ پیام ذخیره شد.");
        } else {
          sendMessage(contents.message.from.id, "لطفاً یک پیام فوروارد شده از کانال ارسال کنید.");
        }
      }
      else {
        forwardCourseDatas(contents, "courses_records", text);
      }
      if (isAdmin(contents)) {
        sendMessage(senderID, "(مخصوص ادمین های بات) میتوانید پیام های کانال را فوردارد کنید تا به لیست درس اضافه شود یا با /start به منوی اصلی بروید!")
      }
      break;

    case "/courses_files_archives":
      if (getTopic(contents)) {
        if (contents.message && contents.message.forward_from_chat) {
          saveForwardedMessage(contents);
          sendMessage(contents.message.from.id, "✅ پیام ذخیره شد.");
        } else {
          sendMessage(contents.message.from.id, "لطفاً یک پیام فوروارد شده از کانال ارسال کنید.");
        }
      }
      else {
        forwardCourseDatas(contents, "courses_archives", text);
      }
      if (isAdmin(contents)) {
        sendMessage(senderID, "(مخصوص ادمین های بات) میتوانید پیام های کانال را فوردارد کنید تا به لیست درس اضافه شود یا با /start به منوی اصلی بروید!")
      }
      break;

      case "/send_file":
        forwardMessage(contents.message.from.id, contents.message.message_id, ADMIN_ID);
        break;

      case "/set_student_number": 
        setStudentNumber(contents, contents.message.text.trim());
        updateState(contents, null);
        sendMessage(senderID, "شماره دانشجویی شما با موفقیت ثبت شد!")
        break;  
    default:

      break;
  }
}



