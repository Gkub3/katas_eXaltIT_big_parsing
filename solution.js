//Chargement des dépendances
import esMain from 'es-main';
import StreamArray from 'stream-json/streamers/StreamArray.js'
import { Writable } from 'stream'
import fs from 'fs'

/**
 * 
 * Recherche de la propriété "name" d'un objet dans une liste depuis sa propriété "id"
 * dans un fichier JSON
 * 
 * @param {string} file Le chemin d'accès au fichier
 * @param {number | string} id L'identifiant de l'objet dans la liste
 * @returns {string} Propriété "name" de l'objet
 */
export function searchNameInJSONFile (file, id) {
    return new Promise((resolve, reject) => {
        try {
            //Création du flux de lecture du fichier
            const fileStream = fs.createReadStream(file)
            const jsonStream = StreamArray.withParser()
            const processingStream = new Writable({
                write({ key, value }, encoding, callback) {
                    if (value && value.id == id) { return resolve(value.name) }
                    //On lit l'objet suivant si la valeur recherchée n'a pas été lu
                    callback()
                },
                //On indique que l'on souhaite lire objet par objet
                objectMode: true
            })
            //L'event 'error' est levé si le fichier n'est pas accessible
            fileStream.on('error', (err) => reject(err.message || err))
            //L'event 'error' est levé si le fichier ne peut pas être parser
            jsonStream.on('error', (err) => reject(err.message || err))
            //L'event 'error' est levé si une erreur se produit lors de l'écriture dans le flux
            processingStream.on('error', (err) => reject(err.message || err))
            //L'event 'finish' est levé si aucune correspondance n'a été trouvé
            processingStream.on('finish', () => resolve(null))
            //On écoute les événements des flux
            fileStream.pipe(jsonStream.input)
            jsonStream.pipe(processingStream)  
        } catch (err) { reject(err.message || err) }
    })
}
/**
 * Permet de détecter si le fichier à été exécuté directement
 */
if (esMain(import.meta)) {
    /**
     * Récupération de l'Id recherché depuis les arguments de la ligne de commande
     * Id est un nombre et est le premier argument
     */
    const myArgs = process.argv.slice(2)
    if (!myArgs[0]) { console.error("Can't find an 'id' in command-line arguments") }
    else {
        searchNameInJSONFile('./input.json', myArgs[0]).then((name) => {
            if (name)   { console.log(name) }
            else        { console.error("Not found") }
        }).catch((message) => {
            console.error(message)
        })
    }
}