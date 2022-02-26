// comensando con el trabajo
const axios = require ('axios')
const uuid = require ('uuid');
const fs = require ('fs').promises;
const express = require ('express')

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

// guardando la informacion roomates
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

// post gastos
app.post('/gasto', async (req, res) => {
    let body;
    req.on('data', (payload) => {
      body = JSON.parse(payload);
     
    });
    req.on('end', async() => {
        
        // creamos el gasto
        const newgasto = {
            id : uuid.v4().slice(30),
            roommate : body.roommate,
            descripcion : body.descripcion,
            monto : body.monto
        }
        
        //leemos el archivo creado
        let db = await fs.readFile('db.json', 'utf-8')

        //transformando de un string a un objeto
        db = JSON.parse(db)

        //enviamos la informacion a la base de datos
        db.gastos.push(newgasto)


        // finalmente guardo el nuevo gastos
        await fs.writeFile('db.json', JSON.stringify(db), 'utf-8') 
        res.send({todo:'ok'})
    });
    
});

// get de roomate 
app.get('/roommates', async(req, res)=>{
    let database = await fs.readFile('db.json', 'utf-8')
    database = JSON.parse(database)
    let roommates = database.roommates
    res.send({roommates})
})
// get de gastos
app.get('/gastos', async(req, res)=>{
    let database = await fs.readFile('db.json', 'utf-8')
    database = JSON.parse(database)
    let gastos = database.gastos
    res.send({gastos})
})

// modificar gastos
app.put('/gasto', async (req, res) => {
    //guardamos el id a modificar
    const id = req.query.id;
    
    let body;
    req.on('data', (payload) => {
      body = JSON.parse(payload);
     
    });
    req.on('end', async() => {
                 
        //leemos el archivo creado
        let db = await fs.readFile('db.json', 'utf-8')

        //transformando de un string a un objeto
        db = JSON.parse(db)
        
        
        let gasto = db.gastos.find(g=>g.id === id )
        gasto.roommate = body.roommate
        gasto.monto = body.monto
        gasto.descripcion = body.descripcion
        const roommate = db.roommates.find(r => r.nombre == body.roommate);
        const gastosRoommate = db.gastos.filter( g => g.roommate = roommate.nombre).map(g => g.monto).reduce( (x, y) => x + y);
        roommate.debe = gastosRoommate;
        // finalmente guardo el nuevo gastos
        await fs.writeFile('db.json', JSON.stringify(db), 'utf-8') 
        res.send({todo:'ok'})
    });
    
});
/*
// borrando archivo   
app.delete('/eliminar', async (req, res)=>{
    const id = req.query.id;   
    console.log(id)
    let body;
    req.on('data', (payload) => {
      body = JSON.parse(payload);
     
    });
    req.on('end', async() => {
              
        //leemos el archivo creado
        let db = await fs.readFile('db.json', 'utf-8')

        //transformando de un string a un objeto
        db = JSON.parse(db)

        const gasto = db.gastos.find(g=>g.id === id )
        console.log(gasto)
        gasto.roommate = body.roommate
        gasto.monto = body.monto
        gasto.descripcion = body.descripcion
        const roommate = db.roommates.find(r => r.nombre == body.roommate);
        const gastosRoommate = db.gastos.filter( g => g.roommate = roommate.nombre).map(g => g.monto).reduce( (x, y) => x + y);
        roommate.debe = gastosRoommate;
        
        
        // borramos el archivo
        await fs.unlike('db.json', JSON.stringify(db), 'utf-8') 
        res.send({todo:'ok'})
        
    });   
         
})
*/
// borrando archivo   
app.get('/eliminar', (req, res)=>{
    const id = req.query.id; 
    console.log(id);
    const archivo = `db.json/${req.query.id}`;
    fs.unlink(archivo, function(){
        
        res.send('archivo borrado');
    });  
    console.log('archivo borrado correctamente');
     
})

//correr el servidor
app.listen(3000, function(){
    console.log('servidor corriendo en el puerto 3000')
});
