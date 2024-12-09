

import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

const app = express();
const PORT = 5000;

// Configuração do middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 minutos
}));

// Variáveis simulando o banco de dados
let usuarios = [];
let mensagens = [];

// Rota para servir arquivos estáticos
app.use(express.static('public'));

// Login
app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: './views' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Validação simples para login (substitua por uma validação real)
  if (username === 'admin' && password === 'admin123') {
    req.session.loggedIn = true;
    res.redirect('/menu');
  } else {
    res.status(401).send('Credenciais inválidas');
  }
});

// Menu do sistema (apenas acessível após login)
app.get('/menu', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }
  res.sendFile('menu.html', { root: './public' });
});

// Cadastro de usuários
app.get('/cadastroUsuario', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }
  res.sendFile('cadastroUsuario.html', { root: './public' });
});

app.post('/cadastrarUsuario', (req, res) => {
  const { nome, dataNascimento, nickname } = req.body;

  if (!nome || !dataNascimento || !nickname) {
    return res.status(400).send('Todos os campos são obrigatórios');
  }

  usuarios.push({ nome, dataNascimento, nickname });
  res.redirect('/usuarios');
});

// Exibir lista de usuários cadastrados
app.get('/usuarios', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }
  let userList = '<h2>Usuários Cadastrados</h2><ul>';
  usuarios.forEach(user => {
    userList += `<li>${user.nome} - ${user.nickname} - ${user.dataNascimento}</li>`;
  });
  userList += '</ul>';
  userList += '<a href="/cadastroUsuario">Voltar para o cadastro</a><br>';
  userList += '<a href="/menu">Voltar para o menu</a>';
  res.send(userList);
});

// Bate-papo
app.get('/batePapo', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }
  let messageList = '<h2>Bate-papo</h2><ul>';
  mensagens.forEach(msg => {
    messageList += `<li>${msg.nickname}: ${msg.mensagem}</li>`;
  });
  messageList += '</ul>';
  messageList += `
    <form action="/enviarMensagem" method="POST">
      <input type="text" name="mensagem" placeholder="Digite sua mensagem" required>
      <button type="submit">Enviar</button>
    </form>
    <a href="/menu">Voltar para o menu</a>
  `;
  res.send(messageList);
});

app.post('/enviarMensagem', (req, res) => {
  const { mensagem } = req.body;
  if (!mensagem) {
    return res.status(400).send('A mensagem não pode estar vazia');
  }
  mensagens.push({ nickname: 'Usuário', mensagem });
  res.redirect('/batePapo');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.post('/cadastro', (req, res) => {
    const { nome, username, password } = req.body;
  
    if (usuarios.find(user => user.username === username)) {
      return res.send('Este nome de usuário já está em uso.');
    }
  
    // Adiciona o novo usuário ao banco fictício
    usuarios.push({ nome, username, password });
    
    // Redireciona para a página de login após o cadastro
    res.redirect('/login');  // Redireciona corretamente para a página de login
  });
  