// Não precisamos declarar novamente se já foi declarado no firebaseConfig.js
// const auth = firebase.auth();  // Removido, pois já está definido no firebaseConfig.js
const firestore = firebase.firestore();

// Inicializa o Html5QrCode e configura o leitor de código
const html5QrCode = new Html5QrCode("leitor-codigo");
let cameraIsRunning = false; // Variável para verificar se a câmera está rodando

// Função que será chamada ao escanear com sucesso
function onScanSuccess(decodedText, decodedResult) {
    if (cameraIsRunning) {
        console.log(`Código detectado: ${decodedText}`);
        document.getElementById('barcode-result').innerText = decodedText;

        // Para a câmera automaticamente após escanear o código com sucesso
        html5QrCode.stop().then(() => {
            console.log("Câmera parada automaticamente após escanear.");
            cameraIsRunning = false;
            document.getElementById('pararCameraBtn').style.display = "none";
        }).catch(err => {
            console.error("Erro ao parar a câmera: ", err);
        });
    }
}

// Função para lidar com falhas na leitura
function onScanFailure(error) {
    console.warn(`Erro ao escanear código: ${error}`);
}

// Botão de iniciar a câmera
document.getElementById('iniciarCameraBtn')?.addEventListener('click', function() {
    if (!cameraIsRunning) {
        html5QrCode.start(
            { facingMode: { exact: "environment" } },  // Força o uso da câmera traseira
            { fps: 10, qrbox: { width: 250, height: 250 } },  // Configurações de escaneamento
            onScanSuccess,  // Função chamada ao escanear com sucesso
            onScanFailure   // Função chamada em caso de erro de escaneamento
        ).then(() => {
            cameraIsRunning = true;
            document.getElementById('pararCameraBtn').style.display = "block";
        }).catch(err => {
            console.error("Erro ao iniciar a câmera: ", err);
        });
    }
});

// Botão de parar a câmera (caso o usuário queira parar manualmente)
document.getElementById('pararCameraBtn')?.addEventListener('click', function() {
    if (cameraIsRunning) {
        html5QrCode.stop().then(() => {
            console.log("Câmera parada manualmente.");
            cameraIsRunning = false;
            document.getElementById('pararCameraBtn').style.display = "none";
        }).catch(err => {
            console.error("Erro ao parar a câmera: ", err);
        });
    }
});


// Salvar produto no Firestore com verificação de duplicidade e ID do usuário
document.getElementById('product-form')?.addEventListener('submit', function(e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const precoCusto = parseFloat(document.getElementById('precoCusto').value);
  const precoVenda = parseFloat(document.getElementById('precoVenda').value);
  const grupo = document.getElementById('grupo').value;
  const codigoBarras = document.getElementById('barcode-result').innerText || document.getElementById('codigoInterno').value;  // Verifica se há código escaneado ou digitado

  // Obter o ID do usuário autenticado
  const userId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;

  if (!userId) {
    alert('Você precisa estar logado para cadastrar produtos.');
    return;
  }

  // Referência à coleção de produtos no Firestore
  const produtosRef = firestore.collection('products');

  // Verifica se já existe um produto com o mesmo código de barras
  produtosRef.where('codigoBarras', '==', codigoBarras).get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        // Se já existe um produto com o mesmo código de barras, exibe uma mensagem de aviso
        alert('Produto com o código de barras ' + codigoBarras + ' já está cadastrado!');
      } else {
        // Se não existe, cadastra o novo produto com o ID do usuário
        produtosRef.add({
          nome: nome,
          precoCusto: precoCusto,
          precoVenda: precoVenda,
          grupo: grupo,
          codigoBarras: codigoBarras,
          userId: userId,  // Adiciona o ID do usuário que cadastrou o produto
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function() {
          alert('Produto salvo com sucesso!');
          window.location.href = 'menu.html'; // Redireciona após salvar
        }).catch(function(error) {
          console.error('Erro ao salvar produto:', error);
        });
      }
    })
    .catch(function(error) {
      console.error('Erro ao verificar duplicidade de código de barras:', error);
    });
});




// Listar produtos na tela de edição/deleção
function listarProdutos() {
  firestore.collection('products').get().then(function(snapshot) {
    var tbody = document.querySelector('#product-list tbody');
    tbody.innerHTML = ''; // Limpa a tabela
    snapshot.forEach(function(doc) {
      var produto = doc.data();
      var tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${produto.nome}</td>
        <td>${produto.precoCusto}</td>
        <td>${produto.precoVenda}</td>
        <td>${produto.grupo}</td>
        <td>${produto.codigoBarras}</td>
        <td>
          <button onclick="editarProduto('${doc.id}')">Editar</button>
          <button onclick="deletarProduto('${doc.id}')">Deletar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

listarProdutos();

// Deletar produto
function deletarProduto(id) {
  firestore.collection('products').doc(id).delete().then(function() {
    alert('Produto deletado com sucesso!');
    listarProdutos(); // Atualiza a lista após deletar
  });
}

// Função para editar produto - Lógica será adicionada depois
function editarProduto(id) {
  // Adicionar a lógica de edição
}
