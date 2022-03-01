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


// get de gastos
app.get('/gastos', async(req, res)=>{
    let database = await fs.readFile('db.json', 'utf-8')
    database = JSON.parse(database)
    let gastos = database.gastos
    res.send({gastos})
})

// get de roomate 
app.get('/roommates', async(req, res)=>{
    let database = await fs.readFile('db.json', 'utf-8')
    database = JSON.parse(database)
    let roommates = database.roommates
    res.send({roommates})
})
//obteniendo los datos
async function newroommate(){
    const datos = await axios.get('https://randomuser.me/api')
    //desempaquetando
    const randomuser = datos.data.results[0]
    const newuser = {
        // generamos el ID se utiliza slice elimina 30 caracteres
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

// modificar gastos
app.put('/gasto', async (req, res) => {
    //guardamos el id a modificar
    const id = req.query.id;
    
    let body;
    req.on('data', (payload) => {
    // /transformando de un string a un objeto
      body = JSON.parse(payload);
    });

    req.on('end', async() => {
                 
        //leemos el archivo creado
        let db = await fs.readFile('db.json', 'utf-8')

        //transformando de un string a un objeto
        db = JSON.parse(db)
        
        // buscamos el id unico asociado al gasto
        let gasto = db.gastos.find(g=>g.id === id )
        // creamos la variable para actualizar el monto del debe
        let oldgasto = gasto.monto

        gasto.roommate = body.roommate
        gasto.monto = body.monto
        gasto.descripcion = body.descripcion
        // creamos la variable roommate para encontrar el nombre
        let roommate = db.roommates.find(r => r.nombre == body.roommate);
        //guardamos el valor antiguo en una variable 
        let roommateold = roommate.debe
        // guardamos el nuevo valor en una variable
        roommate.debe = roommate.debe + (gasto.monto - oldgasto)
        
                
        // se guarda el nuevo gastos
        await fs.writeFile('db.json', JSON.stringify(db), 'utf-8') 
        res.send({todo:'ok'})
    });
    
});

// borrando archivo   

app.delete('/gasto', async(req, res) => { 
    const id = req.query.id; 
    // lee el archivo de la base de datos
    let db = await fs.readFile("db.json", 'utf-8'); 
    db = JSON.parse(db); 
    // extrae los gastos distintos al id buscado y los guarda en una variable
    const bgastos = db.gastos.filter(x => x.id !== id); 
    console.log(bgastos)
    //guarda los datos en la base de datos
    db.gastos = bgastos 
    //escribo la nueva ainformacion
    await fs.writeFile('db.json', JSON.stringify(db), 'utf-8'); 
    res.send(db); 
}); 

//correr el servidor
app.listen(3000, function(){
    console.log('servidor corriendo en el puerto 3000')
});
