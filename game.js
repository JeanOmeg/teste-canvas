const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

let tamanho_tela_x
let tamanho_tela_y
let tamanhoTile
let linhas
let colunas
let larguraTabuleiro
let alturaTabuleiro
let tamanhoSeta
let velocidadeScroll

function start() {
  tamanho_tela_x = window.innerWidth
  tamanho_tela_y = window.innerHeight

  tamanhoTile = 65

  linhas = 20
  colunas = 20
  larguraTabuleiro = colunas * tamanhoTile
  alturaTabuleiro = linhas * tamanhoTile

  canvas.width = tamanho_tela_x
  canvas.height = tamanho_tela_y

  function verificarDispositivoMovel() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  if (verificarDispositivoMovel()) {
    tamanhoSeta = canvas.height * 0.1
  } else {
    tamanhoSeta = canvas.width = canvas.height * 0.05
  }

  velocidadeScroll = 50

  desenharTabuleiro()
  setTimeout(() => {
    desenharSetasScroll()
  }, 200)
}

let offsetX = 0
let offsetY = 0
let mouseX, mouseY
let estaScrollando = false
let direcaoScroll = null

const botaoMover = document.getElementById('moveButton')
const botaoAtacar = document.getElementById('attackButton')

const jogadores = [
  { x: 0, y: 0, imagem: 'char1.png', nome: 'Player 1' },
  { x: 1, y: 0, imagem: 'char2.png', nome: 'Player 2' }
]

let jogadorSelecionado = null

const cacheImagens = {}

function carregarImagem(src, callback) {
  if (cacheImagens[src]) {
    callback(cacheImagens[src])
    return
  }
  const img = new Image()
  img.onload = function () {
    cacheImagens[src] = img
    callback(img)
  }
  img.src = src
}

function carregarEDesenharImagem(imgSrc, x, y, largura, altura) {
  const img = new Image()
  img.onload = function () {
    ctx.drawImage(img, x, y, largura, altura)
    ctx.lineWidth = 0.1
    ctx.strokeRect(x, y, largura, altura)
  }
  img.src = imgSrc
}

// Desenhar o tabuleiro e as miniaturas
function desenharTabuleiro() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Desenhar o tabuleiro
  for (let linha = 0; linha < linhas; linha++) {
    for (let coluna = 0; coluna < colunas; coluna++) {
      const x = coluna * tamanhoTile - offsetX
      const y = linha * tamanhoTile - offsetY
      carregarImagem('chao.png', function (img) {
        ctx.drawImage(img, x, y, tamanhoTile, tamanhoTile)
        ctx.lineWidth = 0.1
        ctx.strokeRect(x, y, tamanhoTile, tamanhoTile)
      })
    }
  }

  // Desenhar os jogadores
  jogadores.forEach(jogador => {
    const x = jogador.x * tamanhoTile - offsetX
    const y = jogador.y * tamanhoTile - offsetY
    carregarImagem(jogador.imagem, function (img) {
      ctx.drawImage(img, x, y, tamanhoTile, tamanhoTile)
    })
  })

  desenharSetasScroll()
}

// Desenhar as setas de deslocamento
function desenharSetasScroll() {
  ctx.fillStyle = 'rgb(255, 0, 0)'
  ctx.beginPath()

  if (offsetX + canvas.width < larguraTabuleiro) {
    // Seta para a direita
    ctx.moveTo(canvas.width - tamanhoSeta, canvas.height / 2 - tamanhoSeta / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.lineTo(canvas.width - tamanhoSeta, canvas.height / 2 + tamanhoSeta / 2)
    ctx.closePath()
    ctx.fill()
  }

  if (offsetY + canvas.height < alturaTabuleiro) {
    // Seta para baixo
    ctx.moveTo(canvas.width / 2 - tamanhoSeta / 2, canvas.height - tamanhoSeta)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.lineTo(canvas.width / 2 + tamanhoSeta / 2, canvas.height - tamanhoSeta)
    ctx.closePath()
    ctx.fill()
  }

  if (offsetX > 0) {
    // Seta para a esquerda
    ctx.moveTo(tamanhoSeta, canvas.height / 2 - tamanhoSeta / 2)
    ctx.lineTo(0, canvas.height / 2)
    ctx.lineTo(tamanhoSeta, canvas.height / 2 + tamanhoSeta / 2)
    ctx.closePath()
    ctx.fill()
  }

  if (offsetY > 0) {
    // Seta para cima
    ctx.moveTo(canvas.width / 2 - tamanhoSeta / 2, tamanhoSeta)
    ctx.lineTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2 + tamanhoSeta / 2, tamanhoSeta)
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

  const coluna = Math.floor((mouseX + offsetX) / tamanhoTile)
  const linha = Math.floor((mouseY + offsetY) / tamanhoTile)

  jogadorSelecionado = jogadores.find(jogador => jogador.x === coluna && jogador.y === linha)

  if (jogadorSelecionado) {
    botaoMover.style.display = 'inline-block'
    botaoAtacar.style.display = 'inline-block'

    const outroJogador = jogadores.find(jogador => jogador !== jogadorSelecionado && saoAdjacentes(jogador, jogadorSelecionado))
    botaoAtacar.disabled = !outroJogador

    botaoMover.onclick = () => moverJogador(jogadorSelecionado)
    botaoAtacar.onclick = () => atacarJogador(jogadorSelecionado, outroJogador)
  } else {
    botaoMover.style.display = 'none'
    botaoAtacar.style.display = 'none'
  }
})

function moverJogador(jogador) {
  const novaX = prompt('Nova posição X:', jogador.x)
  const novaY = prompt('Nova posição Y:', jogador.y)

  if (novaX !== null && novaY !== null) {
    jogador.x = Math.max(0, Math.min(colunas - 1, parseInt(novaX)))
    jogador.y = Math.max(0, Math.min(linhas - 1, parseInt(novaY)))
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

  if (mouseX > canvas.width - tamanhoSeta && mouseY > canvas.height / 2 - tamanhoSeta / 2 && mouseY < canvas.height / 2 + tamanhoSeta / 2 && offsetX + canvas.width < larguraTabuleiro) {
    estaScrollando = true
    direcaoScroll = 'direita'
  } else if (mouseX < tamanhoSeta && mouseY > canvas.height / 2 - tamanhoSeta / 2 && mouseY < canvas.height / 2 + tamanhoSeta / 2 && offsetX > 0) {
    estaScrollando = true
    direcaoScroll = 'esquerda'
  } else if (mouseY > canvas.height - tamanhoSeta && mouseX > canvas.width / 2 - tamanhoSeta / 2 && mouseX < canvas.width / 2 + tamanhoSeta / 2 && offsetY + canvas.height < alturaTabuleiro) {
    estaScrollando = true
    direcaoScroll = 'baixo'
  } else if (mouseY < tamanhoSeta && mouseX > canvas.width / 2 - tamanhoSeta / 2 && mouseX < canvas.width / 2 + tamanhoSeta / 2 && offsetY > 0) {
    estaScrollando = true
    direcaoScroll = 'cima'
  }
}

function pararScroll() {
  estaScrollando = false
  direcaoScroll = null
}

// Adiciona os eventos de mouse
canvas.addEventListener('mousedown', iniciarScroll)
canvas.addEventListener('mouseup', pararScroll)

// Adiciona os eventos de toque
canvas.addEventListener('touchstart', iniciarScroll)
canvas.addEventListener('touchend', pararScroll)

function scrollarTabuleiro() {
  if (estaScrollando) {
    if (direcaoScroll === 'direita' && offsetX + canvas.width < larguraTabuleiro) {
      offsetX = Math.min(larguraTabuleiro - canvas.width, offsetX + velocidadeScroll)
    } else if (direcaoScroll === 'esquerda' && offsetX > 0) {
      offsetX = Math.max(0, offsetX - velocidadeScroll)
    } else if (direcaoScroll === 'baixo' && offsetY + canvas.height < alturaTabuleiro) {
      offsetY = Math.min(alturaTabuleiro - canvas.height, offsetY + velocidadeScroll)
    } else if (direcaoScroll === 'cima' && offsetY > 0) {
      offsetY = Math.max(0, offsetY - velocidadeScroll)
    }
    desenharTabuleiro()
  }
}

// Executar a checagem de scroll periodicamente
start()
setInterval(scrollarTabuleiro, 100)

setInterval(() => {
  window.addEventListener('resize', () => {
    start()
  })
}, 500)
