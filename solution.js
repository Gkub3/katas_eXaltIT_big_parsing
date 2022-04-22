/**
 * The problem consists in extracting data from a JSON file too big to be parsed / hold in memory as a whole.
 * The file is a valid JSON file, consisting in an array of objects. The structure of objects is not known, apart from the fact that they have an id and a name attributes.
 * The formatting of the file is not known: it may be a single line file, or formatted using a variety of whitespace options.
 * The problem consists in writing a Node.js program which must:
 *      - accept an id as a command-line argument
 *      - log to the console the name attribute of the object with the corresponding id.
 * 
 * To simulate low memory constraints, your program should work with node --max_old_space_size=50
 */

//Chargement des dépendances
const   StreamArray = require('stream-json/streamers/StreamArray'), //Permet de transformer une liste d'objets en flux
        { Writable } = require('stream'),
        fs = require('fs')

/**
 * 
 * Recherche de la propriété "name" d'un objet dans une liste depuis sa propriété "id"
 * dans un fichier JSON
 * 
 * @param {string} file Le chemin d'accès au fichier
 * @param {number | string} id L'identifiant de l'objet dans la liste
 * @returns {string} Propriété "name" de l'objet
 */
const searchNameInJSONFile = (file, id) => {
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
 if (require.main === module) {
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

module.exports.searchNameInJSONFile = searchNameInJSONFile;
