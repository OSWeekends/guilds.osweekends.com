        const config = {
          apiKey: "AIzaSyC5LhSMIpkBhdaOrKf5d7Q2wu6Cb5V8fJc",
          authDomain: "guilds-osw.firebaseapp.com",
          databaseURL: "https://guilds-osw.firebaseio.com",
          projectId: "guilds-osw",
          storageBucket: "guilds-osw.appspot.com",
          messagingSenderId: "919919244515"
        };

        firebase.initializeApp(config);

        const guildersRef = firebase.database().ref().child('guilders');
        const avatarsRef = firebase.database().ref().child('avatars');

        const guildersSelector = document.querySelector(".guilders > ul");
        const joinSelector = document.querySelector(".join");

        function joinTheCommunity() {
          const provider = new firebase.auth.GithubAuthProvider();

          firebase.auth().signInWithPopup(provider).then(result => {
            const authData = result.user.providerData[0];
            const guilderData = {
              "avatar": result.additionalUserInfo.profile.avatar_url,
              "name": result.additionalUserInfo.profile.name,
              "login": result.additionalUserInfo.profile.login
            };
            guildersRef.child(authData.uid).update({
              "authData": authData,
              "user": result.additionalUserInfo
            });

            avatarsRef.child(authData.uid).update(guilderData)

            showModal("good", "¡Ya eres del equipo!<br>Pronto contactará contigo alguien de OSW.", () => {
              joinSelector.style.display = "none";
              guildersSelector.innerHTML += `<li class="newGuilder">
                    <img class="flexibleMedia" src="${guilderData.avatar}" alt="${guilderData.name} (${guilderData.login})">
                </li>`
            })

          }).catch(error => {
            showModal("bad", "Tenemos un error con la autentificación. Por favor intentalo de nuevo o contactanos en <a target='_blank' href='https://twitter.com/oswguilds'>@OSWGuilds</a>")
            console.warn("Login Failed!", error);
          });
        }

        function addGuilders(snapshot) {
          const guilders = snapshot.val();
          for (const guilderID in guilders) {
            const guilder = guilders[guilderID];
            guildersSelector.innerHTML += `<li>
                    <img class="flexibleMedia" src="${guilder.avatar}" alt="${guilder.name} (${guilder.login})">
                </li>`
          }
        }

        function removeModal() {
          document.querySelector(".modal").outerHTML = "";
        }

        function showModal(status, msg, next) {

          document.body.innerHTML += `
            <div class="modal">
                <div class="mensaje">
                    <i class="ico ${status}"></i><p>${msg}</p>
                    <div class="cerrar-btn"></div>
                </div>
            </div>`;

          document.querySelector(".modal").addEventListener("click", () => {
            removeModal(next)
          })
        }

        avatarsRef.once("value", addGuilders);
        joinSelector.addEventListener("click", joinTheCommunity)