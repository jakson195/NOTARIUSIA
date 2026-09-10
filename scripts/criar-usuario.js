// Script para o ADMIN (você) criar o tabelionato + o login de um cliente.
// Ainda não existe tela de cadastro — é assim que se cria acesso por
// enquanto, rodando localmente com a DATABASE_URL de produção no .env.
//
// Uso:
//   node scripts/criar-usuario.js "Nome do Tabelionato" "email@cliente.com" "senha-temporaria" "Nome da Pessoa"
//
// Exemplo:
//   node scripts/criar-usuario.js "1º Tabelionato de Notas de Sombrio" "contato@tabeliaosombrio.com.br" "TrocarDepois123" "Maria Silva"
//
// Depois de rodar, informe o e-mail e a senha ao cliente e recomende trocar
// a senha assim que possível (ainda não existe tela de troca de senha —
// para trocar, rode este script de novo criando outro usuário, ou peça
// para eu adicionar essa tela).

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const [, , nomeTabelionato, email, senha, nomeUsuario] = process.argv;

  if (!nomeTabelionato || !email || !senha || !nomeUsuario) {
    console.error(
      'Uso: node scripts/criar-usuario.js "Nome do Tabelionato" "email@cliente.com" "senha" "Nome da Pessoa"'
    );
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const tabelionato = await prisma.tabelionato.create({
    data: { nome: nomeTabelionato },
  });

  const usuario = await prisma.usuario.create({
    data: {
      nome: nomeUsuario,
      email: email.toLowerCase().trim(),
      senhaHash,
      papel: 'ADMIN',
      tabelionatoId: tabelionato.id,
    },
  });

  console.log('');
  console.log('Tabelionato criado:', tabelionato.nome, `(${tabelionato.id})`);
  console.log('Login criado com sucesso — envie estes dados ao cliente:');
  console.log('  E-mail:', usuario.email);
  console.log('  Senha :', senha);
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
