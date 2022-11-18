import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import moment from 'moment-timezone';
import mysql from 'mysql2/promise';
moment.locale('pt-br');

async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;

    //const connection = await mysql.createConnection("mysql://root:@localhost:3306/rentalbot");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
    });
    //const connection = await mysql.createConnection("mysql://rentalbot:zap3537shop11@190.102.40.78:3306/rentalbot");
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}
//connect();

export async function findNotSended() {
    const conn = await connect();
    const query = conn.query('SELECT * FROM dados WHERE telegram_aviso_enviado = "N" AND dados LIKE "%custom.chamada_object%" AND dados LIKE "%aguardando abertura%" ORDER BY id ASC');
    const rows = await query;
    return rows[0];
}

export async function findAll() {
    const conn = await connect();
    const query = conn.query('SELECT * FROM dados ORDER BY id DESC LIMIT 500 OFFSET 999');
    const rows = await query;
    return rows[0];
}

export async function setSended(id) {
    const conn = await connect();
    let query = 'UPDATE dados SET telegram_aviso_enviado="Y" WHERE id=?';
    let values = [id];

    return await conn.query(query, values, findAll);

}

export async function setCreated(id, created) {
    const conn = await connect();
    let query = 'UPDATE dados SET created=? WHERE id=?';
    let values = [created, id];

    return await conn.query(query, values, findAll);

}

