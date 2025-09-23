const apiKeyInput = document.getElementById("apiKeyInput");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");

// Converter o texto markdown em HTML

const markdownToHtml = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};



const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const pergunta = `
       ##Especialidade
        Você é um especialista em ${game} e pode responder perguntas sobre o jogo, incluindo mecânicas, estratégias, lore e muito mais.

        ##tarefa
        Responda à pergunta do usuário sobre ${game} de forma clara e concisa, fornecendo informações úteis e relevantes. Se necessário, utilize ferramentas de pesquisa para obter informações adicionais.

        ##regras
       - Se voce não souber a resposta, diga que não sabe. Se a pergunta não for sobre ${game}, informe que você só pode responder perguntas sobre ${game}.
        -considere  data atual ${new Date().toLocaleDateString("pt-BR")}
        -faça pesquisas atualizadas sobre o patch mais recente do jogo ${game} e forneça informações precisas e atualizadas.

        ##Resposta
        -Responda à pergunta do usuário de forma clara e concisa, fornecendo informações úteis e relevantes. Se necessário, utilize ferramentas de pesquisa para obter informações adicionais.
        -No maximo 500 caracteres.
        -nao faca saudação, ou despedida, apenas responda a pergunta do usuário.

        ##exemplo de resposta
        - pergunta do usuário: Melhor build rengar jungle
        -resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

    ---
        Aqui está a pergunta do usuário: ${question}
      `;
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: pergunta,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  // Chamada API
  const response = await fetch(geminiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  const data = await response.json();

  return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (event) => {
  event.preventDefault();

  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  // Validação de preenchimento de formulário
  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    const text = await perguntarAI(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHtml(text);
    aiResponse.classList.remove("hidden");
    questionInput.value = ""; // Limpar o campo de pergunta após enviar
  } catch (error) {
    console.log("Erro: ", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", enviarFormulario);
