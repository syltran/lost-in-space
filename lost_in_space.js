// Tran Sylvain et Hakim Aoudia 
// Jeu : Lost in Space

"use strict";
let canvas = document.getElementById("game_area");
let context = canvas.getContext("2d");


// ------------------Initialisation-------------------

// Gère les variables du joueur
/* Le vaisseau du joueur est carré car on avait oublié qu'il devait être triangulaire. 
Au final, on l'a laissé carré car cela ne change en rien le jeu*/
let player = {
    x: 300,
    y: 550,
    speedX: 0,
    speedY: 0,
    taille: 5,
    color: 'orange'
};

// Gère les variables de scores et de vie du joueur
let events = {
    score: 0,
    vie: 3,
    timeLife: 0 // permet de savoir quand le joueur a perdu une vie (pour ensuite rajouter un délai de 1 seconde entre chaque dégat subit)
};
let canLoseLifeBool = true; // true veut dire qu'on peut perdre des vies / false le contraire 
let finJeuBool = false; // false pour dire que le jeu n'est pas terminé / true le contraire
let messagefindejeu = " ";

// Gère le fond d'astéroïdes
let asteroid = {
    taille: 3,
    speed: 5,
    lst: [] // liste des astéroïdes créés
};

// Gère les variables des tirs du joueur
let ball = {
    color: 'red',
    taille: 5,
    speed: 10,
    All: [], // liste des balles tirées par le joueur
    AllposInit: [], /* idem sauf que celle-ci ne va pas etre modifiée. 
                    Elle va servir à sauvegarder la position initial des balles*/

    timeinit: 0 // permet de savoir quand le joueur a tiré (pour ensuite rajouter un délai de 500ms entre chaque tir)
};
let canShootBool = true; // true veut dire que le joueur peut tirer / false le contraire 

// Gère les variables des méchants (vaisseaux extra-terestres)
let mechant = {
    color: 'green',
    taille: 5,
    nombre: 1, // mettez un nombre n, il y aura 2n ennemis (n à gauche, n à droite)
    // (On a mis 10 car 150 (donc 300 au total) c'était beaucoup trop, mais c'est modifiable)
    Left: [], // liste des méchants à gauche
    Right: [], // liste des méchants à droite
    speedX: 3,
    speedY: 1
};

/* Chaque alien créé aura sa propre trajectoire/parcours (vu qu'ils spawn à des endroits différents)
dans le sens où ils ne vont pas atteindre les bords du jeu et donc rebondir 
au même moment d'où l'utilité des listes suivantes: */
let [dxLeft, dyLeft] = [[], []]; 
let [dxRight, dyRight] = [[], []]; 

// Gère les variables du boss final
let boss = {
    x: 270,
    y: 30,
    speedX: 3,
    speedY: 1,
    
    color: 'green',
    taille: 100,
    vie: 20,

    ballDown: [], // liste des balles pointant vers le bas
    ballUp: [], // liste des balles pointant vers le haut
    ballLeft: [], // liste des balles pointant vers la gauche
    ballRight: [], // liste des balles pointant vers la droite 
 
    colorball: 'lightblue',
    speedball: 5,
    tailleball: 5
};
let apparitionBossBool = false; // false veut dire que le boss ne peut pas apparaître / true le contraire
// The Boss apparaîtra quand tous les vaisseaux extra-terrestres seront morts!


class MyVaisseau {
    movement() {
        /* Méthode permettant le mouvement du joueur */
        draw(player.x, player.y, 'black', player.taille);
        player.x += player.speedX;
        player.y += player.speedY;
        bordure();
        draw(player.x, player.y, player.color, player.taille);
    };

    shoot() {
        /* Méthode permettant de gérer les tirs du joueur */
        drawScore("score: " + events.score, "black", canvas.width - 100, 5);
        canShoot();
        moveBall();

        if (apparitionBossBool == true) {
            drawVieBoss("vie Boss: " + boss.vie, "black");
            degatballBoss(boss.x, boss.y, boss.taille);
            drawVieBoss("vie Boss: " + boss.vie, "red");
        };

        mortAliens();
        drawScore("score: " + events.score, "red", canvas.width - 100, 5);
        mortBoss();
    };

    mesVies() {
        /* Méthode permettant de gérer les vies du joueur */
        drawVie("vie: " + events.vie, "black", canvas.width - 165, 5);

        canLoseLife();
        if (canLoseLifeBool == true) {
            collisionVaisseaux(player.x, player.y, mechant.Left, mechant.taille);
            collisionVaisseaux(player.x, player.y, mechant.Right, mechant.taille);
        };

        if (apparitionBossBool == true) {
            if (canLoseLifeBool == true) {
                collisionBoss(player.x, player.y, boss.x, boss.y, boss.taille);
                collisionBallBoss(player.x, player.y, boss.ballDown, boss.tailleball);
                collisionBallBoss(player.x, player.y, boss.ballUp, boss.tailleball);
                collisionBallBoss(player.x, player.y, boss.ballLeft, boss.tailleball);
                collisionBallBoss(player.x, player.y, boss.ballRight, boss.tailleball);
            };
        };

        drawVie("vie: " + events.vie, "red", canvas.width - 165, 5);
        Plusdevie();
    } 
};

let obj = new MyVaisseau();

CreateAliens();
dxdy(dxLeft, dyLeft, mechant.Left);
dxdy(dxRight, dyRight, mechant.Right);



// ---------------------Fonction principale---------------------
window.onload = function() {
    /* Permet de gérer toutes les fonctions essentielles au jeu */
    window.setInterval(animate, 15);
    window.setInterval(moveAliensLeft, 60);
    window.setInterval(moveAliensRight, 60);
    

    window.setInterval(asteroidCree, 230);
    window.setInterval(asteroidMove, 15);

    window.setInterval(moveBoss, 60);

    window.setInterval(ModeTir1, 500);
    window.setInterval(ModeTir2, 1400);
    window.setInterval(moveBallBoss, 20);
};



// -------------------------Events---------------------------
function drawScore(score, color, xpos, ypos) {
    /* Fonction permettant d'écrire le score du joueur à la position (xpos, ypos)*/
    context.fillStyle = "black";
    context.fillRect(xpos, ypos, 100, 30);

    context.font = "20px Arial";
    context.fillStyle = color;
    context.fillText(score, xpos, ypos+25);
};

function drawVie(vie, color, xpos, ypos) {
    /* Fonction permettant d'écrire les vies du joueur à la position (xpos, ypos)*/
    context.fillStyle = "black";
    context.fillRect(xpos, ypos, 50, 30);

    context.font = "20px Arial";
    context.fillStyle = color;
    context.fillText(vie, xpos, ypos+25);
}

function drawVieBoss(vie, color) {
    /* Fonction permettant d'écrire les vies du boss*/
    context.fillStyle = "black";
    context.fillRect(canvas.width - 300, 5, 135, 30);

    context.font = "20px Arial";
    context.fillStyle = color;
    context.fillText(vie, canvas.width - 300, 30);
}


// -----Asteroid------
function asteroidCree(){
    /* Fonction permettant de créer des astéroïdes en haut de l'écran aux coordonnées (x, y) x étant aléatoire, compris 
    entre 0 et la largeur max du canva donc 600*/
    asteroid.lst.push([Math.floor(canvas.width *  Math.random()), 0]);
}

function asteroidMove(){
    /* Fonction permettant de mettre en mouvement chaque astéroïde créé, ils vont alors descendre*/
    drawBall(asteroid.lst, "black", asteroid.taille);
    let all = asteroid.lst;
    for(let i=0; i < all.length; i++) {
        all[i][1] += asteroid.speed;
        asteroidDelete();
    };
    drawBall(asteroid.lst, "gray", asteroid.taille);
}

function asteroidDelete(){
    /* Fonction qui supprime les astéroïdes lorsqu'ils atteignent le bas de l'écran*/
    for(let i=0; i < asteroid.lst.length; i++) {
        let y = asteroid.lst[i][1];
        if(y > canvas.height) {
            asteroid.lst.splice(i, 1);
        }
    }
}



// ------------------------MonVaisseau--------------------------
function draw(x, y, color, taille) {
    /* Permet de dessiner un carré à la position (x, y) souhaitée avec la couleur et la taille voulu*/
    context.fillStyle = color;
    context.fillRect(x, y, taille, taille);
};

window.addEventListener('keydown', function(event) {
    /* Permet de gérer les mouvements et les tirs du joueur grâce aux touches du clavier lors de l'appui*/
    let e = event.keyCode;
    if (e == 38) { player.speedY = -5;}  // touche up --> aller en haut
    if (e == 40) { player.speedY = 5;}  // touche down --> aller en bas
    if (e == 37) { player.speedX = -5;}  // touche left --> aller à gauche
    if (e == 39) { player.speedX = 5;}  // touche right --> aller à droite

    // touche espace --> tirer
    if (e == 32 && canShootBool == true) { 
        canShootBool = false;
        ball.timeinit = new Date().getTime(); // on récupère le temps au moment où on tire

        ball.All.push([player.x, player.y]);
        ball.AllposInit.push([player.x, player.y]); 
        // console.log(JSON.stringify(ball.All))
    }
});

function canShoot(){
    /* Calcule le temps passé entre le précédent tir et le temps "maintenant".
    Si c'est supérieur à 500ms alors on peux retirer à nouveau*/
    let mtn = new Date();
    if(mtn.getTime() - ball.timeinit > 500){
        canShootBool = true;
    }
}

window.addEventListener('keyup', function(event) {
    /* Permet d'arrêter le mouvement du joueur au moment où la touche (haut, bas, gauche, droite) est relachée */
    let e = event.keyCode;
    if (e == 38 || e == 40)  { player.speedY = 0; } // touche up et down
    if (e == 37 || e == 39)  { player.speedX = 0; } // touche left et right
});

function animate() {
    /* Fonction principale qui anime le joueur. Tant que le jeu n'est pas fini, 
    le joueur pourra bouger, tirer, perdre des vies, etc. Sinon on affiche un message de fin de jeu
    et le jeu prend fin*/
    if (finJeuBool == false) {
        obj.movement();
        obj.shoot();
        obj.mesVies();
    } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawFindeJeu(messagefindejeu);
    }
};


// -------Tire--------
function drawBall(all, color, taille) {
    /* Permet de dessiner les balles du jeu*/
    for(let i=0; i < all.length; i++) {
        let [x, y] = [all[i][0], all[i][1]];
        draw(x, y, color, taille);
    };
};

function moveBall() {
    /* Permet le mouvement des balles tirées par le joueur vers le haut de l'écran*/
    drawBall(ball.All, "black", ball.taille);
    for(let i=0; i < ball.All.length; i++) {
        ball.All[i][1] -= ball.speed;
        deleteBall();
        degatBall(mechant.Left, dxLeft, dyLeft, mechant.taille);
        degatBall(mechant.Right, dxRight, dyRight, mechant.taille);
    };
    drawBall(ball.All, ball.color, ball.taille);
}

function deleteBall() {
    /* Supprime les balles tirées lorsqu'ils atteignent le haut de l'écran ou lorsqu'ils
    parcourent une distance correspondant à la moitié de la hauteur du canvas.*/
    for(let i=0; i < ball.All.length; i++) {
        let xball = ball.All[i][0];
        let yball = ball.All[i][1];

        let yInit = ball.AllposInit[i][1]; // on récupére la position initiale de la balle correspondante 
        // on fait la différence pour obtenir la distance qui sépare la positon initiale de la positon courante
        let distance = yInit - yball; 

        if(yball < 0) {
            ball.All.splice(i, 1);
            ball.AllposInit.splice(i, 1);
        };

        if(distance > canvas.height/2){
            ball.All.splice(i, 1);
            ball.AllposInit.splice(i, 1);
            draw(xball, yball, "black", ball.taille);
        };
    };
}



// ------bordure------
function bordure() {
    /* Si le joueur sort de l'écran par la gauche, il se téléportera à droite et inversement du côté droit.
    Si le joueur touche le bord haut ou bas de l'écran, alors il ne peux plus continuer dans cette direction*/
    if (player.x < 0) {
        player.x = canvas.width - player.taille;
    };
    if (player.x >= canvas.width) {
        player.x = 0;
    };
    if (player.y <= 0) {
        player.y = 0;
    };
    if (player.y >= canvas.height - player.taille) {
        player.y = canvas.height - player.taille;
    };
}



// --------------------------MECHANTS---------------------------
function CreateAliens() {
    /* Permet de créer des aliens de chaque coté de l'écran avec une position aléatoire */
    for(let i=0; i < mechant.nombre; i++) {
        let yLeft = Math.floor(canvas.height/2 * Math.random()); // y aléatoire entre 0 et 300
        let yRight = Math.floor(canvas.height/2 * Math.random()); // idem
        let xLeft = Math.floor(150 *  Math.random()); // x aléatoire entre 0 et 150
        let xRight = Math.floor(canvas.width - 150 + (150 *  Math.random())); // x aléatoire entre 450 et 600
        
        mechant.Left.push([xLeft, yLeft]);
        mechant.Right.push([xRight, yRight]);
    };
    // console.log(JSON.stringify(mechant.Left));
    // console.log(JSON.stringify(mechant.Right));
}

function drawSpaceshipAliens(mechant, color, taille) {
    /* Récupère les positions de chaque ennemi pour ensuite les dessiner. */
    for(let i=0; i < mechant.length; i++) {
        let [x, y] = [mechant[i][0], mechant[i][1]];
        draw(x, y, color, taille);
    };
}

function moveAliensLeft() {
    /* Fonction permettant de mettre en mouvement les ennemis à gauche et de les faire rebondir sur les murs*/
    if(finJeuBool == false) {
        drawSpaceshipAliens(mechant.Left, "black", mechant.taille);
        for(let i=0; i < mechant.Left.length; i++) {
            mechant.Left[i][0]+= dxLeft[i];
            mechant.Left[i][1]+= dyLeft[i];

            /* Lorsqu'un vaisseau extra-terrestre touche le bas ou le haut de l'écran, il rebondit et gagne 5% en vitesse à chaque rebond*/
            if (mechant.Left[i][0] <= 0 || mechant.Left[i][0] >= canvas.width) {
                dxLeft[i] = - Math.floor(dxLeft[i] * (1 + 5/100));
            };

            /* Lorsqu'un vaisseau extra-terrestre touche le haut ou le bas de l'écran, il rebondit et gagne 10% en vitesse à chaque rebond*/
            if (mechant.Left[i][1] <= 0 || mechant.Left[i][1] >= canvas.height) {
                dyLeft[i] = - Math.floor(dyLeft[i] * (1 + 10/100));
            };
        };
        drawSpaceshipAliens(mechant.Left, mechant.color, mechant.taille);
    }
}

function moveAliensRight() {
    /* Fonction permettant de mettre en mouvement les ennemis à droite et de les faire rebondir sur les murs*/
    if(finJeuBool == false) {
        drawSpaceshipAliens(mechant.Right, "black", mechant.taille);
        for(let i=0; i < mechant.Right.length; i++) {
            mechant.Right[i][0]-= dxRight[i];
            mechant.Right[i][1]+= dyRight[i];
            
            /* Lorsqu'un vaisseau extra-terrestre touche le bas ou le haut de l'écran, il rebondit et gagne 5% en vitesse à chaque rebond*/
            if (mechant.Right[i][0] <= 0 || mechant.Right[i][0] >= canvas.width) {
                dxRight[i] = - Math.floor(dxRight[i] * (1 + 5/100));
            };

            /* Lorsqu'un vaisseau extra-terrestre touche le haut ou le bas de l'écran, il rebondit et gagne 10% en vitesse à chaque rebond*/
            if (mechant.Right[i][1] <= 0 || mechant.Right[i][1] >= canvas.height) {
                dyRight[i] = - Math.floor(dyRight[i] * (1 + 10/100));
            };
        };
        drawSpaceshipAliens(mechant.Right, mechant.color, mechant.taille);
    }
}

function dxdy(dx, dy, mechants) {
    /* Vu que les Aliens spawn à des endroits différents, ils auront une trajectoire (menant au bord du jeu) 
    différente donc il faut pourvoir adapter la direction des aliens en fonctions de qui touche le bord du jeu ou pas 
    à tel moment, d'où l'utilité de cette fonction.
    Donc, on va ajouter autant de 3 (= mechant.speedX) dans la liste dx qu'il y a de vaisseaux dans la liste mechants. 
    Pareil avec dy 
    */
    for(let i=0; i < mechants.length; i++) {
        dx.push(mechant.speedX);
        dy.push(mechant.speedY);
    };
}

function mortAliens() {
    /* Si tout les aliens meurent, le boss apparait */
    if (mechant.Left.length <= 0) {
        if (mechant.Right.length <= 0) {
            apparitionBossBool = true;
        };
    };
}


// -----------------------Collision/Dégâts--------------------------
function degatBall(mechant, dx, dy, taille) {
    /* Permet de tuer un extra-terrestre si celui-ci est touché par une balle */
    for(let p=0; p < ball.All.length; p++) {
        let xball = ball.All[p][0];
        let yball = ball.All[p][1];


        for(let i=0; i < mechant.length; i++) {
            let x = mechant[i][0];
            let y = mechant[i][1];

            if (x <= xball && xball <= x + taille || x <= xball + ball.taille && xball + ball.taille <= x + taille || xball <= x && x <= xball + ball.taille) {
                if (y <= yball && yball <= y + taille || y <= yball + ball.taille && yball + ball.taille <= y + taille || yball <= y && y <= yball + ball.taille) {
                    mechant.splice(i, 1);
                    dx.splice(i, 1);
                    dy.splice(i, 1);
                    draw(x, y, "black", taille);

                    ball.All.splice(p, 1);
                    ball.AllposInit.splice(p, 1);
                    draw(xball, yball, "black", ball.taille);

                    events.score += 1; // le joueur gagne 1 point par vaisseau tué
                }
            };
        };
    };
};

function degatballBoss(xboss, yboss, taille) {
    /* Permet de réduire la vie du boss de 1 s'il est touché par une balle*/
    for(let p=0; p < ball.All.length; p++) {
        let xball = ball.All[p][0];
        let yball = ball.All[p][1];

        if (xboss <= xball && xball <= xboss + taille || xboss <= xball + ball.taille && xball + ball.taille <= xboss + taille) {
            if (yboss <= yball && yball <= yboss + taille || yboss <= yball + ball.taille && yball + ball.taille <= yboss + taille) {
                boss.vie -= 1;
                events.score += 1; // 1 dégât au boss raporte 1 point au joueur 

                ball.All.splice(p, 1);
                ball.AllposInit.splice(p, 1);
                draw(xball, yball, "black", ball.taille);
            };
        };
    };
}


function collisionVaisseaux(xplayer, yplayer, mechant, taille) {
    /* Gère la collision entre le joueur et les vaisseaux extra-terrestres */
    for(let i=0; i < mechant.length; i++) {
        let x = mechant[i][0];
        let y = mechant[i][1];

        if (x <= xplayer && xplayer <= x + taille || x <= xplayer + player.taille && xplayer + player.taille <= x + taille || xplayer <= x && x <= xplayer + player.taille) {
            if (y <= yplayer && yplayer <= y + taille || y <= yplayer + player.taille && yplayer + player.taille <= y + taille || yplayer <= y && y <= yplayer + player.taille) {
                events.vie -= 1; // le joueur perd 1 vie

                canLoseLifeBool = false;
                events.timeLife = new Date().getTime(); // on récupère le temps à l'instant où le joueur perd une vie 

            };
        };
    };
};

function collisionBoss(xplayer, yplayer, xboss, yboss, taille) {
    /* Gère la collision entre le joueur et le boss final */
    if (xboss <= xplayer && xplayer <= xboss + taille || xboss <= xplayer + player.taille && xplayer + player.taille <= xboss + taille) {
        if (yboss <= yplayer && yplayer <= yboss + taille || yboss <= yplayer + player.taille && yplayer + player.taille <= yboss + taille) {
            events.vie -= 1; // le joueur perd 1 vie

            canLoseLifeBool = false;
            events.timeLife = new Date().getTime(); // on récupère le temps à l'instant où le joueur perd une vie 
        };
    };
}

function collisionBallBoss(xplayer, yplayer, ball, taille) {
    /* Gère la collision entre le joueur et les tirs du boss */
    for(let i=0; i < ball.length; i++) {
        let x = ball[i][0];
        let y = ball[i][1];

        if (x <= xplayer && xplayer <= x + taille || x <= xplayer + player.taille && xplayer + player.taille <= x + taille || xplayer <= x && x <= xplayer + player.taille) {
            if (y <= yplayer && yplayer <= y + taille || y <= yplayer + player.taille && yplayer + player.taille <= y + taille || yplayer <= y && y <= yplayer + player.taille) {
                events.vie -= 1; // le joueur perd 1 vie

                canLoseLifeBool = false;
                events.timeLife = new Date().getTime(); // on récupère le temps à l'instant où le joueur perd une vie 
            };
        };
    };
}


function canLoseLife() {
    /*  Calcule le temps passé entre le moment où le joueur a perdu une vie pour la dernier fois et le temps "maintenant".
    Si c'est supérieur à 1s alors on peux à nouveau perdre une vie. */
    let mtn = new Date();
    if(mtn.getTime() - events.timeLife > 1000){
        canLoseLifeBool = true;
    };
}



// -------------------------FinalBoss---------------------------
function moveBoss() {
    /* Gère les mouvements du boss */
    if(finJeuBool == false) {
        if(apparitionBossBool == true) {
            draw(boss.x, boss.y, "black", boss.taille);
            boss.x += boss.speedX;
            boss.y += boss.speedY;
    
            if (boss.x <= 0 || boss.x >= canvas.width - boss.taille) {
            boss.speedX = -boss.speedX;
            };
    
            if (boss.y <= 0 || boss.y >= canvas.height - boss.taille) {
            boss.speedY = -boss.speedY;
            };
            draw(boss.x, boss.y, boss.color, boss.taille);
        };  
    };
}


// -----TirduBoss------
function ModeTir1() {
    /* Gère le premier mode de tir du boss. 
    Créer une balle aléatoire sur les côtés du boss*/
    if(finJeuBool == false) {
        if(apparitionBossBool == true) {
            // Créer une balle aléatoire sur le côté inférieur du boss
            boss.ballDown.push([Math.floor(boss.x + (boss.taille *  Math.random())), boss.y + boss.taille])
            // idem sur le côté supérieur du boss
            boss.ballUp.push([Math.floor(boss.x + (boss.taille *  Math.random())), boss.y])
            // idem sur le côté gauche du boss
            boss.ballLeft.push([boss.x ,Math.floor(boss.y + (boss.taille *  Math.random()))])
            // idem sur le côté droit du boss
            boss.ballRight.push([boss.x + boss.taille ,Math.floor(boss.y + (boss.taille *  Math.random()))])
        };
    };
}

function ModeTir2() {
    /* Gère le deuxièmre mode de tir du boss 
    Créer une lignée de balles (10) sur les côtés du boss*/
    if(finJeuBool == false) {
        if(apparitionBossBool == true) {
            for(let i=0; i < boss.taille; i += 10) { // on incrémente i de 10 pour avoir une lignée de 10 balles
                // Créer une lignée de balles sur le côté inférieur du boss
                boss.ballDown.push([boss.x + i, boss.y + boss.taille])
                // idem sur le côté supérieur du boss
                boss.ballUp.push([boss.x + i, boss.y])
                // idem sur le côté gauche du boss
                boss.ballLeft.push([boss.x, boss.y + i])
                // idem sur le côté droit du boss
                boss.ballRight.push([boss.x + boss.taille, boss.y + i])
            };
        };
    };
}

function moveBallBoss() {
    /* Fait bouger les balles du boss selon une direction */
    if(finJeuBool == false) {
        if(apparitionBossBool == true) {
            drawBallBoss(boss.ballDown, 1, boss.speedball)
            drawBallBoss(boss.ballUp, 1, -boss.speedball) // ici on a fait -boss.speedball car on veut que les balles montent vers le haut
            drawBallBoss(boss.ballLeft, 0, -boss.speedball) // idem car on veut qu'elles aillent vers la gauche
            drawBallBoss(boss.ballRight, 0, boss.speedball)
        };
    };
}


function drawBallBoss(ball, xouy, speedball) {
    /* Gère l'affichage et le mouvements des balles du boss à l'écran 
        param xouy: 0 pour x et 1 pour y*/
    drawBall(ball, "black", boss.tailleball);
    for(let i=0; i < ball.length; i++) {
        ball[i][xouy] += speedball;
        deleteBallBoss(ball);
    };
    drawBall(ball, boss.colorball, boss.tailleball);
}


function deleteBallBoss(ball) {
    /* Supprime les balles du boss si celles-ci sortent de l'écran */
    for(let i=0; i < ball.length; i++) {
        let xball = ball[i][0];
        let yball = ball[i][1];
        if(xball < 0 ||xball > canvas.width) {
            ball.splice(i, 1);
        }
        if(yball < 0 || yball > canvas.height) {
            ball.splice(i, 1);
        };
    };
}



// ------------------------FinJeu------------------------
function drawFindeJeu(message){
    /* Affiche les résultats du joueur (ses vies et son score) à l'écran ainsi qu'un message de fin de jeu*/
    drawScore("score: " + events.score, "red", canvas.width/2-30, canvas.height/2+30);
    drawVie("vie: " + events.vie, "red", canvas.width/2-20, canvas.height/2+10);

    context.fillStyle = "black";
    context.fillRect(canvas.width/2-160, canvas.height/2-25, 360, 30);

    context.font = "20px Arial";
    context.fillStyle = "red";
    context.fillText(message, canvas.width/2-160, canvas.height/2);
}


function Plusdevie() {
    /* Quand le joueur n'a plus de vie alors on affiche un message de défaite */
    if (events.vie <= 0) {
        events.vie = 0; /* On a mis ça car il pouvait y avoir des bugs, du genre 
        quand on prend soit 2 balles au même moment ou soit la balle + une collision avec un vaisseau
        extra-terrestre ou le boss. Du coup, ça permet d'eviter d'avoir un nombre de vie négatif
        sur le menu de fin*/

        finJeuBool = true;
        messagefindejeu = "Vous êtes mort ! F5 pour recommencer"
    }
}


function mortBoss() {
    /* Si le joueur parvient à vaincre le boss et donc si celui-ci n'a plus de vie 
    alors on affiche un message de victoire */
    if (boss.vie <= 0) {
        finJeuBool = true;
        messagefindejeu = "Vous avez gagné ! F5 pour recommencer"
    }
}