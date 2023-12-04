const express = require('express')
const multer = require('multer');
const path = require('path');

const fs = require('fs');

const app = express();
const port = 10000;

console.log("Current directory:", __dirname);


app.use(express.static('public'));
app.set('view engine', 'ejs');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
const upload = multer({ storage: storage });


let questions = require('./questions.json');
const players = require('./players.json');
const allowedPlayers = require('./allowed-players.json')

app.post('/adminFile', upload.single('file'), (req, res) => {
    const uploadedFile = req.file;
    console.log(req.file)
    if (!uploadedFile) {
      return res.status(400).send('No file uploaded.');
    }
    questions = require('./questions.json');
    res.render('adminFile' );
  });
  

app.get('/adminFile', (req,res) => {
    console.log("adminFile");
    console.log(req.query.mdp);
    if(!req.query.mdp || req.query.mdp!='Qlikologie'){
        console.log("mdp faux");
        res.render('error', {error : `Soit tu sais pas ecrire soit t'as rien a faire la`});
        return;
    }
    console.log("mdp ok");
    res.render('adminFile');
})

app.get('/reponseFausse', (req, res) => {
    res.render('false', { rep:'Votre reponse est fausse'});
})

app.get('/referentCNIT', (req, res) => {

    const questionDuJour = questions.filter( (obj) => obj.date==new Date().toJSON().substring(0,10) )

    if(questionDuJour.length==0) {
        console.log(questions);
        res.render('error', { error:'Le temps du jeu est revolu'} );
        return;
    }

    if(!req.query.authCode || questionDuJour[0].authCode != req.query.authCode){
        res.render('error', { error:`Arrête les carabistouilles`} );
        return;
    }

    if(questionDuJour.length>0) {
        res.render('question1', {referent: questionDuJour[0].referent} )
    }
    else {
        console.log(questions);
        res.render('error', { error:'Le temps du jeu est revolu'} );
    }
} )

app.get('/referentTT', (req, res) => {
    const questionDuJour = questions.filter( (obj) => obj.date==new Date().toJSON().substring(0,10) )

    if(questionDuJour.length==0) {
        console.log(questions);
        res.render('error', { error:'Le temps du jeu est revolu'} );
        return;
    }

    if(!req.query.authCode || questionDuJour[0].authCode != req.query.authCode){
        res.render('error', { error:`Arrête les carabistouilles`} );
        return;
    }

    if(questionDuJour.length>0) {
        res.render('question1TT', {referent: questionDuJour[0].referent} )
    }
    else {
        console.log(questions);
        res.render('error', { error:'Le temps du jeu est revolu'} );
    }
})

app.get('/codeCNIT', (req, res) => {

    const questionDuJour = questions.filter((obj) => obj.date==new Date().toJSON().substring(0,10));

    if(questionDuJour.length==0) {
        console.log(questions);
        res.render('error', { error:'Le temps du jeu est revolu'} );
        return;
    }

    const codeRestants = questionDuJour[0].questions.filter((obj) => obj.alreadyFound==false);
    const alreadyPlayedDuJour = players.filter( (obj) => obj.date==new Date().toJSON().substring(0,10))[0].players;

    if(!req.query.authCode || questionDuJour[0].authCode != req.query.authCode){
        res.render('error', { error:`Arrête les carabistouilles`} );
        return;
    }

    if(!req.query.player) {
        res.render('error', { error:`Arrête les carabistouilles dans l'URL, envoie moi au moins ton nom`} );
        return;
    }
    
    if(!allowedPlayers.some(player => player.userid === req.query.player)){
        res.render('error', { error:`Arrête les carabistouilles dans l'URL, je ne connais pas ton id, donc tu n'auras pas de code`} );
    }

    if(codeRestants.length==0) {
        res.render('question2', {code: `Malheureusement il n'y a plus de chocolat aujourd'hui`} )
        return;
    }

    if(alreadyPlayedDuJour.includes(req.query.player)) {
        res.render('error', { error:'Tu as deja reçu un code'} );
        return;
    }
    console.log(`${req.query.player} a trouvé un code`);
    codeRestants[0].alreadyFound = true;
    alreadyPlayedDuJour.push(req.query.player);
    res.render('question2', {code: `Voici ton code a donner au referent : ${codeRestants[0].code.toString()}`} )

} )

app.get('/codeTT', (req,res) => {
    const questionDuJour = questions.filter((obj) => obj.date==new Date().toJSON().substring(0,10))

    if(questionDuJour.length==0) {
        console.log(questions);
        res.render('error', { error:'Le temps du jeu est revolu'} );
        return;
    }

    const codeRestants = questionDuJour[0].questions.filter((obj) => obj.alreadyFound==false);
    const alreadyPlayedDuJour = players.filter( (obj) => obj.date==new Date().toJSON().substring(0,10))[0].players;

    if(!req.query.player) {
        res.render('error', { error:`Arrête les carabistouilles dans l'URL, envoie moi au moins ton nom`} );
        return;
    }

    if(!allowedPlayers.some(player => player.userid === req.query.player)){
        res.render('error', { error:`Arrête les carabistouilles dans l'URL, je ne connais pas ton id, donc tu n'auras pas de code`} );
    }

    // if(codeRestants.length==0) {
    //     res.render('error', { error:`Il n'y a plus de codes`} );
    //     return;
    // }

    // if(alreadyPlayedDuJour.includes(req.query.player)) {
    //     res.render('error', { error:'Tu as deja reçu un code'} );
    //     return;
    // }

    res.render('question2', {code: `En esperant te voir au CNIT la prochaine fois pour que tu puisses gagner des chocolats`} )
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})
