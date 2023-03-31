
const Sequelize = require('sequelize')

require('dotenv').config()

const {CONNECTION_STRING} = process.env

const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

module.exports = {
    seed: (req, res) => {
        sequelize.query(`
            DROP TABLE IF EXISTS weapons;
            DROP TABLE IF EXISTS fighters;

            CREATE TABLE fighters(
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                power INT NOT NULL,
                hp INT NOT NULL,
                type VARCHAR NOT NULL
            );
            
            CREATE TABLE weapons(
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL, 
                power INT NOT NULL,
                owner_id INT REFERENCES fighters(id)
            );
            
        `)
        .then(() => {
            console.log('DB seeded!')
            res.sendStatus(200)
        })
        .catch((err) => {
            console.log('you had a Sequelize error in your seed function:')
            console.log(err)
            res.status(500).send(err)
        })
    },

    createFighter: (req, res) => {

        const {name, power, hp, type} = req.body

        sequelize.query(`
            INSERT INTO fighters
            (name, power, hp, type)
            VALUES
            ('${name}', ${power}, ${hp}, '${type}')
            RETURNING*;
        `)
            .then((dbRes) => {
                console.log('createFighter success!')
                res.status(200).send(dbRes[0])
            })
            .catch((theseHands) => {
                console.log('Error with createFighter')
                console.log(theseHands)
                res.status(500).send(theseHands)
            })
    }, 

    getFightersList: (req, res) => {
        // get names and ids from fighters table
        // handle response with .then and .catch

        sequelize.query(`
            SELECT name, id FROM fighters;
        `)
            .then((dbRes) => {
                console.log('getFightersList success!')
                res.status(200).send(dbRes[0])
            })
            .catch((theseHands) => {
                console.log('Error with getFightersList')
                console.log(theseHands)
                res.status(500).send(theseHands)
            })
    }, 

    createWeapon: (req, res) => {

        const {name, power, owner} = req.body

        sequelize.query(`
            INSERT INTO weapons
            (name, power, owner_id)
            VALUES
            ('${name}', ${power}, ${owner})
            RETURNING *;
        `)
            .then((dbRes) => {
                console.log('createWeapon success!')
                res.status(200).send(dbRes[0])
            })
            .catch((theseHands) => {
                console.log('Error with createWeapon')
                console.log(theseHands)
                res.status(500).send(theseHands)
            })
    },

    getFightersWeapons: (req, res) => {
        // select all data from fighters table
        // Join weapons table with fighters table - specifically on id
        // Setup aliases for everything but hp and type
        // handle our response

        sequelize.query(`
            SELECT
                fighters.id AS fighter_id,
                fighters.name AS fighter,
                fighters.power AS fighter_power,
                hp,
                type,
                weapons.id AS weapon_id,
                weapons.name AS weapon,
                weapons.power AS weapon_power
            FROM fighters
            JOIN weapons
            ON fighters.id = weapons.owner_id;
        `)
            .then((dbRes) => {
                console.log('getFightersWeapons success!')
                res.status(200).send(dbRes[0])
            })
            .catch((theseHands) => {
                console.log('Error with getFightersWeapons')
                console.log(theseHands)
                res.status(500).send(theseHands)
            })

    },

    deleteWeapon: (req, res) => {
        const {id} = req.params

        sequelize.query(`
            DELETE FROM weapons
            WHERE id = ${id};
        `)
            .then((dbRes) => {
                console.log('deleteWeapon success!')
                res.status(200).send(dbRes[0])
            })
            .catch((theseHands) => {
                console.log('Error with deleteWeapon')
                console.log(theseHands)
                res.status(500).send(theseHands)
            })
    }
}