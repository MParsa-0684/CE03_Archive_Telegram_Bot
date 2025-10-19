// https://core.telegram.org/bots/api

var canSendFile = false;
var canCheckGrades = false;

function setWebhook() {
  var url = TELEGRAM_URL + "/setWebhook?url=" + WEBAPP_URL;
  fetchAndLog(url);
}

function fetchAndLog(url){
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function sendMessage(receiverID, txtMessage){
  var url = TELEGRAM_URL + "/sendMessage?chat_id=" + receiverID + "&text=" + encodeURIComponent(txtMessage);
  fetchAndLog(url);
}

function copyMessage(senderID, messageID, recieverID){
  var url = TELEGRAM_URL + "/copyMessage?chat_id=" + recieverID + "&from_chat_id=" + senderID + "&message_id=" + messageID;
  fetchAndLog(url);
}

function forwardMessage(senderID, messageID, recieverID){
  var url = TELEGRAM_URL + "/forwardMessage?chat_id=" + recieverID + "&from_chat_id=" + senderID + "&message_id=" + messageID;
  fetchAndLog(url);
}

function sendTelegramRequest(payload) {
  const url = TELEGRAM_URL + "/" + payload.method;
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
}

function setBotCommands() {
  const commands = {
    commands: [
      { command: "start", description: "Start the bot" },
      { command: "help", description: "راهنما" },
      { command: "week_program", description: "برنامه هفتگی" },
      { command: "courses_files", description: "جزوات دروس" },
      { command: "courses_records", description: "ضبط کلاس های دروس" },
      { command: "send_file", description: "فرستادن جزوه" },
      { command: "launch_notifier", description: "یادآوری رزرو ناهار" },
      { command: "teacher_emails_links", description: "ایمیل اساتید" },
      { command: "online_courses_links", description: "لینک کلاس آنلاین اساتید" },
      { command: "check_grades", description: "چک کردن نمرات" },
      { command: "courses_files_archives", description: "آرشیو فایل های دروس" }
    ]
  };

  const payload = {
    method: "setMyCommands",
    ...commands
  };

  sendTelegramRequest(payload);
}

function findData(key, key_name, title, sheet_name)
{
    var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadSheet.getSheetByName(sheet_name);
    var data = sheet.getDataRange().getValues();
    var row = -1, column = -1, key_column = -1;
    //finding key coloumn
    for(var i=0; i<data[0].length;i++){
      if( data[0][i] == key_name){
        key_column = i;
      }
    }
    //finding key row
    for(var i=0;i<data.length;i++){
      if(data[i][key_column] == key){
        row = i;
      }
    }
    //find value coloumn
    for(var i=0;i<data[0].length;i++){
       if(data[0][i]==title){
         column =i;
       }
    }
    if(row!=-1 && column!=-1){
      return data[row][column];
    }
    else{return -1;}
}

function writeData(key, key_name, title,value, sheet)
{
    var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadSheet.getSheetByName(sheet);
    var data = sheet.getDataRange().getValues();
    var column = -1,row=-1, key_column = -1;
    //finding key coloumn
    for(var i=0; i<data[0].length;i++){
      if( data[0][i] == key_name){
        key_column = i;
      }
    }
    //finding key row
    for(var i=0;i<data.length;i++){
      if(data[i][key_column] == key){
        row = i;
      }
    }
    //fund value column
    for(var i=0;i<data[0].length;i++){
       if(data[0][i]==title){
         column =i;
       }
    }
    var cell = sheet.getRange(row+1, column+1);
    cell.setValue(value); 
}

function updateUser(contents) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for(var i = 1; i < data.length; i++) {
    if(data[i][0] == senderID) {
      var cell = usersSheet.getRange(i + 1, 6 + 1);
      cell.setValue(cell.getValue() + 1);
      return; 
    }
  }

  var firstName = "";
  var lastName = "";
  if(contents.message.from.first_name) {
    firstName = contents.message.from.first_name;
  }
  if(contents.message.from.last_name) {
    lastName = contents.message.from.last_name;
  }
  var username = contents.message.from.username;

  usersSheet.appendRow([senderID, firstName, lastName, username, null, false, 1, null, false, null]);
}

function updateState(contents, desiredState) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for(var i = 1; i < data.length; i++) {
    if(data[i][0] == senderID) {
      var cell = usersSheet.getRange(i + 1, 4 + 1);
      if (cell.getValue != desiredState)
        sendNullKeyboardOptions(contents);
      cell.setValue(desiredState);
      var cell2 = usersSheet.getRange(i + 1, 7 + 1);
      cell2.setValue(null)
      return; 
    }
  }
}

function setStudentNumber(contents, studentNumber) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for(var i = 1; i < data.length; i++) {
    if(data[i][0] == senderID) {
      var cell = usersSheet.getRange(i + 1, 9 + 1);
      cell.setValue(studentNumber);
      return; 
    }
  }
}

function initChat(contents) {
  var senderID = contents.message.from.id;

  sendMessage(senderID, "به بات CE03Archive خودش آمدید\nدستور های بسیار زیادی هستند که میتوانید از طریق این بات استفاده کنید\nبرای اطلاعات بیشتر دستور /help را اجرا کنید\nبا آرزوی بهترین ها");
}

function sendHelp(contents) {
  var senderID = contents.message.from.id;
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Help");
  var data = usersSheet.getDataRange().getValues();
  
  for (var i = 0; i < data.length; i++) {
    if (data[i][0]) {
      var message = data[i][0];
      sendMessage(senderID, message);
    }
    else {
      break;
    }
  }

}

function sendWeekProgram(contents) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("week_program");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  let week = []
  for (var j = 0; j < 7; j++) {
    let day = []
    day.push("✅ " + data[0][j] + ":")
    for (var i = 1; i < data.length; i++) {
      if (data[i][j]) {
        day.push(data[i][j])
      }
    }

    let dayString = day.join("\n\t- ");
    week.push(dayString)
  }

  let weekString = week.join("\n")
  sendMessage(senderID, weekString);
}

function isAdmin(contents) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for(var i = 1; i < data.length; i++) {
    if(data[i][0] == senderID) {
      if(String(data[i][5]).toLowerCase() === "true")
        return true;
      else
        return false;
    }
  }
}

function isBlackList(contents) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for(var i = 1; i < data.length; i++) {
    if(data[i][0] == senderID) {
      if(String(data[i][8]).toLowerCase() === "true")
        return true;
      else
        return false;
    }
  }
}

function getStudentNumber(contents) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for(var i = 1; i < data.length; i++) {
    if(data[i][0] == senderID) {
      return String(data[i][9]);
    }
  }
}

function sendAllUsers(message) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    sendMessage(data[i][0], message);
  }
  sendMessage("@shcomp403", message);
}

function foodNotifier(contents) {
    if(isAdmin(contents)) {
      sendMessage(contents.message.from.id, "پیام یادآوری رزرو غذا به همه فرستاده شد!");
      sendAllUsers("رزرو غذا را فراموش نکنید!!! 🍕🍟🍜 \nsetad.dining.sharif.edu");
    }
    else {
      sendMessage(contents.message.from.id, "تنها ادمین ها میتوانند از این کامند استفاده کنند!");
    }
}

function sendTeachersKeyboardOptions(contents) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var teachersSheet = spreadSheet.getSheetByName("teachers");
  var data = teachersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;
  let keyboards = []

  for (var i = 1; i < data.length; i++) {
    keyboards.push([{ text: data[i][0]}]);
  }

  const keyboard = {
    keyboard: keyboards,
    resize_keyboard: true,
    one_time_keyboard: true
  };

  const payload = {
    method: "sendMessage",
    chat_id: senderID,
    text: "لطفا نام استاد مورد نظر را انتخاب بفرمایید:",
    reply_markup: keyboard
  };

  sendTelegramRequest(payload);
}

function getUserState(contents) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for(var i = 1; i < data.length; i++) {
    if(data[i][0] == senderID) {
      return data[i][4];
    }
  }
}

function sendNullKeyboardOptions(contents) {
  const chatId = contents.message.from.id;

  const payload = {
    method: "sendMessage",
    chat_id: chatId,
    text: "درحال بررسی...",
    reply_markup: {
      remove_keyboard: true
    }
  };

  sendTelegramRequest(payload);
}

function sendTeacherData(teacherName, contents, column) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var teachersSheet = spreadSheet.getSheetByName("teachers");
  var data = teachersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == teacherName) {
      sendMessage(senderID, data[i][column]);
      updateState(contents, null);
      return;
    }
  }

  sendMessage(senderID, "نام استاد مورد نظر در لیست موجود نیست!");
}

function addWeekProgram(text, contents) {
  var regex = /([\s\S]+)-([\s\S]+)/;
  var senderID = contents.message.from.id;

  if (!text.match(regex)) {
    sendMessage(senderID, "با فرمت اشتباهی پیام را فرستادید")
    return;
  }
  
  const match = text.match(regex);
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var weekSheet = spreadSheet.getSheetByName("week_program");
  var data = weekSheet.getDataRange().getValues();
  

  for (var j = 0; j < 7; j++) {
    if (data[0][j] == match[1]) {
  
      const lastRow = weekSheet.getRange(weekSheet.getMaxRows(), j + 1).getNextDataCell(SpreadsheetApp.Direction.UP).getRow();

      weekSheet.getRange(lastRow + 1, j + 1).setValue(match[2]);
      sendMessage(senderID, "ددلاین شما با موفقیت اضافه شد!")
      updateState(contents, null);
      return;
    }
  }

  sendMessage(senderID, "روز مورد نظر یافت نشد!");
}

function sendCoursesTopics(contents, topicName) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var teachersSheet = spreadSheet.getSheetByName(topicName);
  var data = teachersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;
  let keyboards = []

  for (var i = 0; i < data[0].length; i += 4) {
    keyboards.push([{ text: data[0][i]}]);
  }

  const keyboard = {
    keyboard: keyboards,
    resize_keyboard: true,
    one_time_keyboard: true
  };

  const payload = {
    method: "sendMessage",
    chat_id: senderID,
    text: "لطفا نام درس مورد نظر را انتخاب بفرمایید:",
    reply_markup: keyboard
  };

  sendTelegramRequest(payload);
}

function forwardCourseDatas(contents, sheetName, courseName) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var teachersSheet = spreadSheet.getSheetByName(sheetName);
  var data = teachersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for (var j = 0; j < data[0].length; j += 4) {
    if (data[0][j] == courseName) {
      for (var i = 2; i < data.length; i++) {
        if (data[i][j]) {
          forwardMessage(data[i][j], data[i][j + 1], senderID);
        }
      }

      updateTopic(contents, courseName);
      sendNullKeyboardOptions(contents);
      return;
    }
  }

  sendMessage(senderID, "درس مورد نظر یافت نشد!")
}

// function saveForwardedMessage(contents) {
//   const spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
//   let str = getUserState(contents).toString();
//   const sheet = spreadSheet.getSheetByName(str.substring(1));

//   const fromChatId = contents.message.forward_from_chat.id;
//   const messageId = contents.message.forward_from_message_id;
//   const caption = contents.message.caption || "";
//   const date = new Date(contents.message.date * 1000);
//   var data = sheet.getDataRange().getValues();
//   var senderID = contents.message.from.id;

//   const values = [fromChatId, messageId, caption, date]

//   for (var j = 0; j < data[0].length; j += 4) {
//     if (data[0][j] == getTopic(contents)) {
//         const lastRow = sheet.getRange(sheet.getMaxRows(), j).getNextDataCell(SpreadsheetApp.Direction.UP).getRow();

//         sheet.getRange(lastRow + 1, j + 1, 1, 4).setValues([values]);
//         return;
//     }
//   }

//   sendMessage(senderID, "انجام نشد!")
// }

function saveForwardedMessage(contents) {
  const spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const senderID = contents.message.from.id;
  const state = getUserState(contents).toString();
  const sheetName = state.startsWith("/") ? state.substring(1) : state;
  const sheet = spreadSheet.getSheetByName(sheetName);

  if (!sheet) {
    sendMessage(senderID, "❌ شیت '" + sheetName + "' پیدا نشد.");
    return;
  }

  const topic = getTopic(contents);
  if (!topic) {
    sendMessage(senderID, "❌ لطفاً ابتدا یک درس را انتخاب کنید.");
    return;
  }

  const fromChatId = contents.message.forward_from_chat.id;
  const messageId = contents.message.forward_from_message_id;
  const caption = contents.message.caption || "";
  const date = new Date(contents.message.date * 1000);

  const data = sheet.getDataRange().getValues();
  const values = [fromChatId, messageId, caption, date];

  for (var j = 0; j < data[0].length; j += 4) {
    const header = (data[0][j] + "").trim();
    if (header === topic.trim()) {
      const lastRow = sheet.getRange(sheet.getMaxRows(), j + 1)
                           .getNextDataCell(SpreadsheetApp.Direction.UP)
                           .getRow();

      sheet.getRange(lastRow + 1, j + 1, 1, 4).setValues([values]);
      sendMessage(senderID, "✅ پیام با موفقیت ذخیره شد!");
      return;
    }
  }

  sendMessage(senderID, "❌ ستون مربوط به درس '" + topic + "' پیدا نشد.");
}

function updateTopic(contents, topic) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for(var i = 1; i < data.length; i++) {
    if(data[i][0] == senderID) {
      var cell = usersSheet.getRange(i + 1, 7 + 1);
      cell.setValue(topic);
      return; 
    }
  }
}

function getTopic(contents) {
  var spreadSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var usersSheet = spreadSheet.getSheetByName("Users");
  var data = usersSheet.getDataRange().getValues();
  var senderID = contents.message.from.id;

  for(var i = 1; i < data.length; i++) {
    if(data[i][0] == senderID) {
      return data[i][7];
    }
  }
}