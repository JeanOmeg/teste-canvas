const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

let tamanho_tela_x
let tamanho_tela_y
let tamanho_casa
let qtd_linhas
let qtd_colunas
let largura_tabuleiro
let altura_tabuleiro
let tamanho_seta
let velocidade_scroll
let offsetX = 0
let offsetY = 0
let mouseX, mouseY
let scroll_tabuleiro
let direcao_scroll
let jogador_selecionado = null
const cache_imagens = {}

const botao_mover = document.getElementById('moveButton')
const botao_atacar = document.getElementById('attackButton')

const lista_jogadores = [
  { x: 0, y: 0, imagem: 'char1.png', nome: 'Player 1' },
  { x: 1, y: 0, imagem: 'char2.png', nome: 'Player 2' }
]

function start() {
  tamanho_tela_x = 600
  tamanho_tela_y = 400
  tamanho_casa = 50
  qtd_colunas = 30
  qtd_linhas = 20
  largura_tabuleiro = qtd_colunas * tamanho_casa
  altura_tabuleiro = qtd_linhas * tamanho_casa
  canvas.width = tamanho_tela_x
  canvas.height = tamanho_tela_y
  tamanho_seta = canvas.height * 0.1
  velocidade_scroll = 50
}

function verificarDispositivoMovel() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function carregarImagem(src, callback) {
  if (cache_imagens[src]) {
    callback(cache_imagens[src])
    return
  }

  const img = new Image()
  img.onload = async function () {
    cache_imagens[src] = img
    await callback(img)
  }
  img.src = src
}

// Função para desenhar o tabuleiro e as miniaturas
async function desenharTabuleiro() {
  let imagensChao = []

  // Desenhar o chão e armazenar as imagens em uma lista
  for (let linha = 0; linha < qtd_linhas; linha++) {
    for (let coluna = 0; coluna < qtd_colunas; coluna++) {
      const x = coluna * tamanho_casa - offsetX
      const y = linha * tamanho_casa - offsetY
      let imgChao = new Image()
      imgChao.src = 'chao.png'
      imagensChao.push({ img: imgChao, x: x, y: y })
    }
  }

  // Função para desenhar todas as imagens do chão após serem carregadas
  async function desenharChao() {
    imagensChao.forEach(async (imagem) => {
      await ctx.drawImage(imagem.img, imagem.x, imagem.y, tamanho_casa, tamanho_casa)
    })

    // Desenhar os jogadores
    lista_jogadores.forEach(jogador => {
      const x = jogador.x * tamanho_casa - offsetX
      const y = jogador.y * tamanho_casa - offsetY
      carregarImagem(jogador.imagem, async function (img) {
        await ctx.drawImage(img, x, y, tamanho_casa, tamanho_casa)
      })
    })

    // Desenhar as linhas do grid
    for (let linha = 0; linha < qtd_linhas; linha++) {
      for (let coluna = 0; coluna < qtd_colunas; coluna++) {
        const x = coluna * tamanho_casa - offsetX
        const y = linha * tamanho_casa - offsetY
        ctx.lineWidth = 0.1
        await ctx.strokeRect(x, y, tamanho_casa, tamanho_casa)
      }
    }

  }

  // Contar quantas imagens já foram carregadas
  let imagensCarregadas = 0

  // Evento de carregamento para cada imagem do chão
  await imagensChao.forEach(imagem => {
    imagem.img.onload = async function () {
      imagensCarregadas++
      // Se todas as imagens do chão forem carregadas, desenhe o tabuleiro completo
      if (imagensCarregadas === imagensChao.length) {
        await desenharChao()
      }
    }
  })

}


// Desenhar as setas de deslocamento
function desenharSetasScroll() {
  ctx.fillStyle = 'rgb(255, 0, 0)'
  ctx.beginPath()

  if (offsetX + canvas.width < largura_tabuleiro) {
    // Seta para a direita
    ctx.moveTo(canvas.width - tamanho_seta, canvas.height / 2 - tamanho_seta / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.lineTo(canvas.width - tamanho_seta, canvas.height / 2 + tamanho_seta / 2)
    ctx.closePath()
    ctx.fill()
  }

  if (offsetY + canvas.height < altura_tabuleiro) {
    // Seta para baixo
    ctx.moveTo(canvas.width / 2 - tamanho_seta / 2, canvas.height - tamanho_seta)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.lineTo(canvas.width / 2 + tamanho_seta / 2, canvas.height - tamanho_seta)
    ctx.closePath()
    ctx.fill()
  }

  if (offsetX > 0) {
    // Seta para a esquerda
    ctx.moveTo(tamanho_seta, canvas.height / 2 - tamanho_seta / 2)
    ctx.lineTo(0, canvas.height / 2)
    ctx.lineTo(tamanho_seta, canvas.height / 2 + tamanho_seta / 2)
    ctx.closePath()
    ctx.fill()
  }

  if (offsetY > 0) {
    // Seta para cima
    ctx.moveTo(canvas.width / 2 - tamanho_seta / 2, tamanho_seta)
    ctx.lineTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2 + tamanho_seta / 2, tamanho_seta)
    ctx.closePath()
    ctx.fill()
  }
}

// Verificar se duas posições são adjacentes
function saoAdjacentes(jogador1, jogador2) {
  return Math.abs(jogador1.x - jogador2.x) + Math.abs(jogador1.y - jogador2.y) === 1
}

// Lidar com cliques no canvas
canvas.addEventListener('click', (evento) => {
  const rect = canvas.getBoundingClientRect()
  const mouseX = evento.clientX - rect.left
  const mouseY = evento.clientY - rect.top

  const coluna = Math.floor((mouseX + offsetX) / tamanho_casa)
  const linha = Math.floor((mouseY + offsetY) / tamanho_casa)

  jogador_selecionado = lista_jogadores.find(jogador => jogador.x === coluna && jogador.y === linha)

  if (jogador_selecionado) {
    botao_mover.style.display = 'inline-block'
    botao_atacar.style.display = 'inline-block'


    const outroJogador = lista_jogadores.find(jogador => jogador !== jogador_selecionado && saoAdjacentes(jogador, jogador_selecionado))
    botao_atacar.disabled = !outroJogador

    botao_mover.onclick = () => moverJogador(jogador_selecionado)
    botao_atacar.onclick = () => atacarJogador(jogador_selecionado, outroJogador)
  } else {
    botao_mover.style.display = 'none'
    botao_atacar.style.display = 'none'
  }
})

function moverJogador(jogador) {
  const novaX = prompt('Nova posição X:', jogador.x)
  const novaY = prompt('Nova posição Y:', jogador.y)

  if (novaX !== null && novaY !== null) {
    jogador.x = Math.max(0, Math.min(qtd_colunas - 1, parseInt(novaX)))
    jogador.y = Math.max(0, Math.min(qtd_linhas - 1, parseInt(novaY)))
    desenharTabuleiro()
  }
}

function atacarJogador(atacante, defensor) {
  if (defensor) {
    alert(`${atacante.nome} ataca ${defensor.nome}!`)
    // Aqui você pode adicionar lógica de dano e remoção de jogador se necessário
  }
}

// Função para obter as coordenadas de toque/mouse
function obterCoordenadas(evento) {
  const rect = canvas.getBoundingClientRect()
  let clientX, clientY

  if (evento.touches && evento.touches.length > 0) {
    clientX = evento.touches[0].clientX
    clientY = evento.touches[0].clientY
  } else {
    clientX = evento.clientX
    clientY = evento.clientY
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

// Função para iniciar o scroll
function iniciarScroll(evento) {
  const { x: mouseX, y: mouseY } = obterCoordenadas(evento)

  if (mouseX > canvas.width - tamanho_seta && mouseY > canvas.height / 2 - tamanho_seta / 2 && mouseY < canvas.height / 2 + tamanho_seta / 2 && offsetX + canvas.width < largura_tabuleiro) {
    scroll_tabuleiro = true
    direcao_scroll = 'direita'
  } else if (mouseX < tamanho_seta && mouseY > canvas.height / 2 - tamanho_seta / 2 && mouseY < canvas.height / 2 + tamanho_seta / 2 && offsetX > 0) {
    scroll_tabuleiro = true
    direcao_scroll = 'esquerda'
  } else if (mouseY > canvas.height - tamanho_seta && mouseX > canvas.width / 2 - tamanho_seta / 2 && mouseX < canvas.width / 2 + tamanho_seta / 2 && offsetY + canvas.height < altura_tabuleiro) {
    scroll_tabuleiro = true
    direcao_scroll = 'baixo'
  } else if (mouseY < tamanho_seta && mouseX > canvas.width / 2 - tamanho_seta / 2 && mouseX < canvas.width / 2 + tamanho_seta / 2 && offsetY > 0) {
    scroll_tabuleiro = true
    direcao_scroll = 'cima'
  }
}

function pararScroll() {
  scroll_tabuleiro = false
  direcao_scroll = null
  setTimeout(desenharSetasScroll, 100)
}

async function scrollarTabuleiro() {

  if (scroll_tabuleiro) {
    if (direcao_scroll === 'direita' && offsetX + canvas.width < largura_tabuleiro) {
      offsetX = Math.min(largura_tabuleiro - canvas.width, offsetX + velocidade_scroll)
    } else if (direcao_scroll === 'esquerda' && offsetX > 0) {
      offsetX = Math.max(0, offsetX - velocidade_scroll)
    } else if (direcao_scroll === 'baixo' && offsetY + canvas.height < altura_tabuleiro) {
      offsetY = Math.min(altura_tabuleiro - canvas.height, offsetY + velocidade_scroll)
    } else if (direcao_scroll === 'cima' && offsetY > 0) {
      offsetY = Math.max(0, offsetY - velocidade_scroll)
    }
    desenharTabuleiro()
  }
}

// Adiciona os eventos de mouse
canvas.addEventListener('mousedown', iniciarScroll)
canvas.addEventListener('mouseup', pararScroll)

// Adiciona os eventos de toque
canvas.addEventListener('touchstart', iniciarScroll)
canvas.addEventListener('touchend', pararScroll)

// Executar a checagem de scroll_tabuleiro periodicamente
start()
desenharTabuleiro()
setTimeout(desenharSetasScroll, 100)

setInterval(scrollarTabuleiro, 100)
