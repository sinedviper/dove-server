# Dove-Server

### :pushpin: About project
<p align="justify">This project is built on the basis of the Apollo server on the usual requests for the dove client. Interaction with the database is carried out through typeorm, so tables and variables are built on its basis. The data is in graphql format. Saving the photo was done through a regular request, since it was not possible to link the graffle-upload library with the apollo server, there was not enough information, and the library itself is not yet supported by the new version of apollo. In this project, there is a cascading deletion for some entities, there is also a check for authorization when receiving data, through a token. I didn’t implement checking and updating the token through refresh and access, since there was a task to make the client more. I took into account all the nuances when deleting photos or chats or contacts, for example, if a user deletes an account, it checks if he has photos and if there are, they are all deleted. There is also a check to confirm the account and if the account is not verified within 15 minutes, it will delete itself.</p>

---

### :book: Libraries

- @apollo/server
- bcrypt
- graphql
- body-parser
- express
- dotenv
- sharp
- nodemailer
- mysql2
- multer
- jsonwebtoken
- type-graphql
- typeorm

---

### :pizza: Commands

- npm run dev: <strong>run in development mode</strong>
- npm run build: <strong>assemble the project</strong>
- npm run start: <strong>run the built project</strong>

---

<div id="badges" align="center">  
<a href="https://www.linkedin.com/in/sinedviper"> 
<img src="https://img.shields.io/badge/LinkedIn-blue?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Badge"/> 
</a> 
<a href="https://www.instagram.com/sinedviper"> 
<img src="https://img.shields.io/badge/Instagram-orange?style=for-the-badge&logo=instagram&logoColor=white" alt="Twitter Badge"/> 
</a>
<a href="https://www.t.me/sinedviper"> 
<img src="https://img.shields.io/badge/Telegram-purple?style=for-the-badge&logo=telegram&logoColor=white" alt="Twitter Badge"/> 
</a>
</div>
