const app = require('../app')
const db = require('../model/db')
const createFolderIsExist = require("../helpers/create-dir");
const UPLOAD_DIR = process.env.UPLOAD_DIR;
const AVATARS_OF_USERS = process.env.AVATARS_OF_USERS;




const PORT = process.env.PORT || 3000
db.then(() => {
  app.listen(PORT, async () => {
    await createFolderIsExist(UPLOAD_DIR);
    await createFolderIsExist(AVATARS_OF_USERS);
    console.log(`Server running. Use our API on port: ${PORT}`)
  })
}).catch((err) => {
  console.log(`Server not running. Error message: ${err.message}`)
  process.exit(1)
})



