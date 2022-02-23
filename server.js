// comensando con el trabajo
const express = require ('express')
const axios = require ('axios')
const uuid = require ('uuid');
const fs = require ('fs').promises;

// despues creo mi app
const app = express();

// creando la carpeta static
app.use(express.static('static'));

// Se configura manejo de formularios
app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );



//obteniendo los datos
async function newroommate(){
    const datos = await axios.get('https://randomuser.me/api')
    //desempaquetando
    const randomuser = datos.data.results[0]
    const newuser = {
        // generamos el ID se utiliza slice para disminuir a 30 los caracteres
        id : uuid.v4().slice(30),
        nombre: randomuser.name.first + ' ' + randomuser.name.last,
        
    }
    return newuser
}

// guardando la informacion d
app.post('/roommate', async(req, res)=>{
    
    let roommate = await newroommate()
    
    //leemos el archivo creado
    let db = await fs.readFile('db.json', 'utf-8')

    //transformando de un string a un objeto
    db = JSON.parse(db)

    //enviamos la informacion a la base de datos
    db.roommates.push(roommate)

    

    // finalmente guardo el nuevo usuario
    await fs.writeFile('db.json', JSON.stringify(db), 'utf-8') 
    res.send({todo:'ok'})

});

// post/ gastos
app.post('/gasto', async (req, res) => {
    let body;
    req.on('data', (payload) => {
      body = JSON.parse(payload);
    });
    req.on('end', () => {
    // acá tenemos que crear el gasto
    
    console.log(`aqui veremos ${db}`);
    res.send({todo: 'OK'});
    });
});


// get de roomate , get / gastos
app.get('/roommates', async(req, res)=>{
    let database = await fs.readFile('db.json', 'utf-8')
    database = JSON.parse(database)
    let roommates = database.roommates
    res.send({roommates})
})
app.get('/gastos', async(req, res)=>{
    let database = await fs.readFile('db.json', 'utf-8')
    database = JSON.parse(database)
    let gastos = database.gastos
    console.log(gastos);
    res.send({gastos})
})


//correr el servidor
app.listen(3000, function(){
    console.log('servidor corriendo en el puerto 3000')
});
