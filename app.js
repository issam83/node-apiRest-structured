require('babel-register')
const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./assets/swagger.json');
const morgan = require('morgan')
const {checkAndChange} = require('./assets/function')
const config = require('./assets/config')
const mysql = require('promise-mysql')

mysql.createConnection({
    host     : config.db.host,
    user     : config.db.user,
    password : config.db.password,
    database : config.db.database
}).then((db) => {

    console.log('connectéé')
    
    const app = express()

    
    let MembresRouter = express.Router()
    let Membres = require('./assets/classes/membres-class')(db, config)
    console.log(Membres)
    
    app.use(morgan('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(config.rootAPI + 'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    
    MembresRouter.route('/:id')
    
        // Recupère un memebre avec son id
        .get(async(req, res) => {
    
            let membre = await Membres.getByID(req.params.id)
            res.json(checkAndChange(membre))

        })
    
        // Modifie un memebre avec son id
        .put(async(req, res) => {

            let updateMembres = await Membres.update(req.params.id, req.body.name)
            res.json(checkAndChange(updateMembres))

        })
    
    
        // Supprime un memebre avec son id
        .delete(async(req, res) => {

            let deleteMembres = await Membres.delete(req.params.id)
            res.json(checkAndChange(deleteMembres))

        })
    
    MembresRouter.route('/')
    
        // Recupère tous les memebres
        .get(async(req, res) => {
            let allMembres = await Membres.getAll(req.query.max)
            res.json(checkAndChange(allMembres))

        })
    
        //Créer un membre avec son nom
        .post(async(req, res) => {
            
            let addMembres = await Membres.addMembre(req.body.name)
            res.json(checkAndChange(addMembres))

        })
    
    app.use(config.rootAPI + 'membres', MembresRouter)
    
    app.listen(config.port, () => {
        console.log('Started on port' + ' ' +config.port)
    })
}).catch((err) => {
    console.log('Error during database connection')
    console.log(err.message)
})
