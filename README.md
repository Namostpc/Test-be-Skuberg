# Test-be-Skuberg

## คำแนะนำสำหรับกรรมการ - การทดสอบระบบ

เอกสารนี้อธิบายขั้นตอนการรันโปรเจคนี้สำหรับการทดสอบระบบ โดยจะเริ่มต้นจากการสร้างและเชื่อมต่อฐานข้อมูล PostgreSQL ด้วย Docker

### 1. ข้อกำหนดเบื้องต้น

โปรดตรวจสอบให้แน่ใจว่าท่านได้ติดตั้ง Docker และ Docker Compose บนเครื่องคอมพิวเตอร์เรียบร้อยแล้ว สามารถดาวน์โหลดและติดตั้งได้จาก (https://www.docker.com/get-started)

### 2. การสร้าง  postgresql database local server

เปิด Terminal หรือ Command prompt
และใช้คำสั่ง นี้ docker run --name my-postgres -p 5432:5432 -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=postgres -d postgres:latest
หลังจากรันคำสั่งแล้ว คุณสามารถตรวจสอบว่า Container ทำงานอยู่หรือไม่ โดยใช้คำสั่ง: docker ps ควรจะเห็น Container ชื่อ your_postgres_container (หรือชื่อที่คุณตั้งไว้) ที่มีสถานะ Up

### 3. สร้าง local database ในเครื่อง
เนื่องจากตอนนี้เราทำการเปิด Local server ด้วย Docker เรียบร้อยแล้ว ท่านสามารถสร้าง Local database ในเครื่องของท่านได้เลย โดยจะใช้ PgAdmin หรือ DBeaver ก็ได้เพื่อง่ายต่อการเชื่อมต่อ
โดยท่านจะต้องใส่ข้อมูล ตามข้อมูลต่อไปนี้

Host:localhost
Port:5432
username:myuser
password:123456
Database: postgres

### 4. การติดตั้ง Dependencies และรัน Application
1. ทำการเปิด Terminal และพิมพ์คำสั่ง npm install / npm i ไปที่ Root Directory ของโปรเจค
2. รันคำสั่ง npm run seed เพื่อทำการสร้างข้อมูลเพื่อการทดสอบ
   ** การ Seed ข้อมูล จะทำการสร้าง User test มาให้ 2 คน และทำการสร้าง wallet ของ user มาให้แล้ว ผู้ตรวจสามารถ นำ user test ไปใช้งานต่อได้ใน API login --> API Create crypto coin ได้เลยครับ ***
3. รันคำสั่ง โดยใช้คำสั่ง npm start เพื่อทำการรันระบบ

api ทั้งหมดจะมี 6 API หลักๆในการทำงานของระบบนี้ 
1. Create User
2. Login
3. Create wallet
4. Create crypto coin
5. Set market
6. trade

โดยแต่ละ API นั้นจะเป็น Method post ทั้งหมด สามารถนำไปทดสอบได้ใน Postman
endpoint ของแต่ละ api ได้แก่
1. http://localhost:3000/api/user/create
2. http://localhost:3000/api/auth/login
3. http://localhost:3000/api/wallet/create
4. http://localhost:3000/api/crypto/create
5. http://localhost:3000/api/market/create
6. http://localhost:3000/api/trade/trading

แต่ละ API จะมี Request body | Header ดังนี้
1. Create User request body
   {
    "username": "you_username",
    "email": "your_email",
    "password": "your_password"
}

2. Login request body
   {
    "email": "your_email_registered",
    "password": "your_password"
}
จะได้ Token ออกมา

3. Create wallet request token(From login), body
   นำ Token ที่ได้จาก Login มาใส่ใน Parameter Headers
   key:token value: response จาก login

   และ body คือ
   {
    "wallet_number": "your_account_number",
    "wallet_amount": amount of money (Integer)
}

4. Create crypto coin request token(From login), body
   นำ Token ที่ได้จาก Login มาใส่ใน Parameter Headers
   key:token value: response จาก login

   และ body คือ
   {
    "crypto_type": "Type_of_crypto_currency",  (BTC,ETH,XRP, DOGE)
    "crypto_amount": amount_of_your_crypto
}

5. Create marketplace request token(From login), body
   นำ Token ที่ได้จาก Login มาใส่ใน Parameter Headers
   key:token value: response จาก login
   
   และ body คือ
   {
    "type_of_coin": "Type_of_crypto_currency", (BTC,ETH,XRP, DOGE)
    "type_of_trading": "BUY or SELL",
    "coin_amount": Crypto that you want to buy and sell
}


** ผู้ตรวจต้องทำการ Login อีก User เพื่อทำการเข้ามาซื้อขายใน Marketplace
6. Trading request token(From login), body

และ body คือ
{
    "market_id": marketplace_id (integer),
    "coin_amount": crypto coin that you want to buy or sell (integer),
    "currency": "THB or USD"
}
