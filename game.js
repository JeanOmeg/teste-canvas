const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

let width = window.innerWidth
let height = window.innerHeight

let tamanhoTile = height / 100 * 10

let linhas = 20
let colunas = 30
let larguraTabuleiro = colunas * tamanhoTile
let alturaTabuleiro = linhas * tamanhoTile

canvas.width = width / 100 * 95
canvas.height = height / 100 * 95

let tamanhoSeta = 100
let velocidadeScroll = 5

function start() {
  width = window.innerWidth
  height = window.innerHeight

  tamanhoTile = height / 100 * 10

  linhas = 20
  colunas = 30
  larguraTabuleiro = colunas * tamanhoTile
  alturaTabuleiro = linhas * tamanhoTile

  canvas.width = width / 100 * 95
  canvas.height = height / 100 * 95

  tamanhoSeta = 100
  velocidadeScroll = 5
}

let offsetX = 0
let offsetY = 0
let mouseX, mouseY
let estaScrollando = false
let direcaoScroll = null

const botaoMover = document.getElementById('moveButton')
const botaoAtacar = document.getElementById('attackButton')

const jogadores = [
  { x: 1, y: 1, cor: 'blue' },
  { x: 28, y: 18, cor: 'red' }
]

let jogadorSelecionado = null

// Desenhar o tabuleiro e as miniaturas
function desenharTabuleiro() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Desenhar o tabuleiro
  for (let linha = 0; linha < linhas; linha++) {
    for (let coluna = 0; coluna < colunas; coluna++) {
      const x = coluna * tamanhoTile - offsetX
      const y = linha * tamanhoTile - offsetY
      ctx.strokeRect(x, y, tamanhoTile, tamanhoTile)
    }
  }

  // Desenhar os jogadores
  jogadores.forEach(jogador => {
    const x = jogador.x * tamanhoTile - offsetX
    const y = jogador.y * tamanhoTile - offsetY
    ctx.fillStyle = jogador.cor
    ctx.fillRect(x, y, tamanhoTile, tamanhoTile)
  })

  // Desenhar as setas de deslocamento
  desenharSetasScroll()
}

// Desenhar as setas de deslocamento
function desenharSetasScroll() {
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
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
    alert(`${atacante.cor} ataca ${defensor.cor}!`)
    // Aqui você pode adicionar lógica de dano e remoção de jogador se necessário
  }
}

// Lidar com clique nas setas de deslocamento
canvas.addEventListener('mousedown', (evento) => {
  const rect = canvas.getBoundingClientRect()
  mouseX = evento.clientX - rect.left
  mouseY = evento.clientY - rect.top

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
})

canvas.addEventListener('mouseup', () => {
  estaScrollando = false
  direcaoScroll = null
})

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
setInterval(scrollarTabuleiro, 100)

desenharTabuleiro()
