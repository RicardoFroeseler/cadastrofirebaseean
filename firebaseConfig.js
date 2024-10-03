// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAH3LARcxyMek_GnWu18qBJIHWNqyFNnVo",
  authDomain: "coletordedadosexcel.firebaseapp.com",
  projectId: "coletordedadosexcel",
  storageBucket: "coletordedadosexcel.appspot.com",
  messagingSenderId: "993639112865",
  appId: "1:993639112865:web:3aa2d08ef30db41d7450e0"
};

// Inicializa o Firebase apenas se ainda não estiver inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Usa a instância já existente
}

// Obtém referências para Auth e Firestore
const auth = firebase.auth();
const firestore = firebase.firestore();

// Função de login com Google (somente se houver o botão de login)
document.addEventListener('DOMContentLoaded', function() {
  const loginGoogleBtn = document.getElementById('login-google');
  
  if (loginGoogleBtn) {
    // Adiciona o listener de login Google apenas se o botão existir na página
    loginGoogleBtn.addEventListener('click', () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then((result) => {
          alert('Bem-vindo, ' + result.user.displayName);
          window.location.href = 'menu.html'; // Redireciona para o menu
        })
        .catch((error) => {
          console.error('Erro ao fazer login:', error); // Captura e exibe o erro
        });
    });
  }
});

