// Script para "adotar" atendimentos antigos (criados antes de existir
// login) para um tabelionato específico — assim eles voltam a aparecer
// na barra lateral de histórico, que agora só mostra o que pertence ao
// tabelionato de quem está logado.
//
// Uso:
//   node scripts/adotar-atendimentos-antigos.js "email-do-usuario@exemplo.com"
//
// Isso vincula TODOS os atendimentos sem tabelionato (tabelionatoId nulo)
// ao tabelionato desse e-mail. Rode só uma vez, e só se você tiver certeza
// de que quer que esse tabelionato "herde" os testes antigos.

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const [, , email] = process.argv;

  if (!email) {
    console.error('Uso: node scripts/adotar-atendimentos-antigos.js "email@exemplo.com"');
    process.exit(1);
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!usuario) {
    console.error('Nenhum usuário encontrado com esse e-mail.');
    process.exit(1);
  }

  const resultado = await prisma.atendimento.updateMany({
    where: { tabelionatoId: null },
    data: {
      tabelionatoId: usuario.tabelionatoId,
      usuarioId: usuario.id,
    },
  });

  console.log(`${resultado.count} atendimento(s) vinculado(s) ao tabelionato de ${email}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
