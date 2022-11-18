import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import { Telegraf } from 'telegraf';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns'
import {findNotSended, setSended, findAll, setCreated} from './db.js';

const branchs = ["GRAVATAI", "S.B.CAMPO"];
const bot = new Telegraf(process.env.BOT_TOKEN);

const readIdsFromFile = async(path) => {
    let ids = [];

    let file = path + "ids.txt"
    let file_content = fs.readFileSync(file, 'utf8');
    if ( file_content != null && file_content != "" ) {
        ids = JSON.parse(file_content);
    }
    return ids;
}

const formatReal = ( _number ) =>
{
    _number = (_number).toLocaleString('pt-BR');
    return _number;
}

function multiDimensionalUnique(arr) {
    var uniques = [];
    var itemsFound = {};
    for(var i = 0, l = arr.length; i < l; i++) {
        var stringified = JSON.stringify(arr[i]);
        if(itemsFound[stringified]) { continue; }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

let processed_verions = [];
setInterval(async () => {
    try{
        console.log('INICIANDO PROCESSO...');
        const notSended = await findNotSended();
        if ( notSended.length > 0 ){

            let dados_retornar = [];

            notSended.map((dado_db)=>{

                dados_retornar = dados_retornar.concat(dado_db.dados.filter(async (dado) => {

                    if ( dado.filial_text && branchs.indexOf(dado.filial_text) > -1 ) {
                        return true;
                    }

                    await setSended(dado_db.id);
                }));

            });

            if ( dados_retornar.length > 0 ) {

                let ids = await readIdsFromFile("./");

                dados_retornar = multiDimensionalUnique(dados_retornar);

                dados_retornar.map(async (dado)=>{

                    if ( dado.status_text != "aguardando abertura" && dado._version && processed_verions.indexOf(dado._version) < 0 ) {
                        return false;
                    }
                    processed_verions.push(dado._version);

                    let message = dado.filial_text + " - " + dado.fila_text + " - " + dado.status_text + "\n\n";

                    const viagens_json = JSON.parse(dado.json_text);
                    const viagens = viagens_json.viagens;

                    Object.keys(viagens).forEach(function(key, index) {
                        message += "Destino: "  + viagens[key].ultimaCidade  + " - (" + formatReal(viagens[key].maiorKm) + "km)" + "\n"; 
                        message += "Valor: R$ " + formatReal(viagens[key].valor) + "\n";
                        message += "Qtd de Veículos: " + formatReal(viagens[key].veiculos) + "\n\n";
                    });

                    message +=  "\n\n";

                    let id_sended = [];
                    ids.map(async (chat_id) => {
                        if ( id_sended.indexOf(chat_id.id) < 0 ) {
                            id_sended.push(chat_id.id);
                           await bot.telegram.sendMessage(chat_id.id, message);
                        }
                    })
                    await sleep(1000);
                })

            }

            //console.log(dados_retornar);
            //notSended.forEach(async (el, index) => {
                //console.log(el);
            //})
        }
        console.log('FINALIZANDO PROCESSO...');
    } catch (e) {
        console.log(e);
        process.exit();
    }

}, process.env.LOOP_TIME);

