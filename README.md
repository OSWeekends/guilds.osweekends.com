# Repository for http://guilds.osweekends.com

## ¡Estamos en una [versión alpha](http://guilds.osweekends.com)!

![IMG](https://media.giphy.com/media/FTfslW7ZAp6KI/giphy.gif)

## Puesta en marcha

Es necesario iniciar MongoDB en local

Crear una tabla `guilds` en una base de datos con el nombre `guilds`, añadir las guilds con el formato:
> guilds, guilds, guiiiilds...

```
{
    "flag" : "metaguild.png",
    "name" : "Metaguild",
    "motto" : "Descripción de la guild...",
    "readme" : "https://...", // Enlace a readme de la guild en github
    "guilders" : [ 
    ],
    "projects" : [ 
        {
            "name" : "Guilds web",
            "motto" : "La web de OSW donde puedes liearte tu mism@ ;)",
            "stack" : [ // Lista de tecnologías, aparecerán como tags
                "nodejs", 
                "javascript", 
                "pillars", 
                "passport"
            ],
            "wanted" : [ 
                "Se busca... Lo he olvidado...",
                "En busca y captura: frontend vuenisim@, recompensa aquí"
            ],
            "status" : 0,          // Hay que definir los estados y ponerle un iconcito
            "repo" : "https://..." // El repo en github
        }
    ]
}
```

### Iniciar:
```
npm install
node index.js
```

### Notas:
* Se sirve el directorio static en /
* En el index mostramos la antigua web y el botón ahora redirige a /guilds
* /guilds es un render del template home.pug (para que poner el mismo nombre)
* Mongo se utiliza para almacenar las guilds, sus guilders y proyectos correspondientes aparte de las sesiones de usuario
* Se utiliza un conector passportGithub automatizado que obliga a estar logeado con github para poder acceder a cualquier Route que tenga la propiedad `passport:true`
* El pseudo-api solo tiene una acción y redirige a /guilds una vez unido el usuario actual al guild seleccionado
* A partir de aquí solo es cuestión de liarse
