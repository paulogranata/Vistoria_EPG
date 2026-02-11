/* ========================================
   VISTORIA IMOBILIÁRIA PWA - JAVASCRIPT
   Otimizado para Samsung Galaxy A31
   ======================================== */

'use strict';

// ========================================
// CONFIGURAÇÕES GLOBAIS
// ========================================

const CONFIG = {
    MAX_PHOTOS: 80, // Limite seguro (não 100)
    MAX_PHOTO_SIZE_KB: 300,
    JPEG_QUALITY: 0.7,
    JPEG_QUALITY_ECONOMIA: 0.55,
    THUMBNAIL_SIZE: 150,
    THUMBNAIL_SIZE_ECONOMIA: 80,
    CAPTURE_WIDTH: 1280, // HD (não Full HD)
    CAPTURE_HEIGHT: 720,
    AUTO_SAVE_INTERVAL: 3000,
    AUTO_SAVE_INTERVAL_ECONOMIA: 10000,
    PDF_TIMEOUT: 60000, // 1 minuto
    TEMPO_ESPERA_MINUTOS: 20,
    DB_NAME: 'VistoriaDB',
    DB_VERSION: 1
};

// ========================================
// ESTADO GLOBAL
// ========================================

const STATE = {
    checkinRealizado: false,
    timestampCheckin: null,
    timestampPrimeiraFoto: null,
    coordenadas: null,
    adicionalNoturno: false,
    adicionalTempoEspera: false,
    impedimentoAcesso: false,
    modoUltraEconomia: false,
    db: null,
    vistoriaAtual: {
        id: null,
        contratante: '',
        endereco: '',
        tipoImovel: '',
        tipologia: '',
        modalidade: '',
        faixaMetragem: '',
        blocos: [],
        assinaturas: [],
        pdfBlob: null
    },
    totalFotos: 0,
    intervaloCronometro: null,
    autoSaveTimeout: null
};

// ========================================
// TABELAS DE HONORÁRIOS
// ========================================

const TABELA_HONORARIOS = {
    Residencial: {
        'Residencial até 60 m²': {
            'Vistoria de entrada': 220,
            'Vistoria de saída': 280,
            'Vistoria fotográfica (registro)': 150,
            'Vistoria de entrega de chaves': 250,
            'Vistoria de recebimento para venda': 250,
            'Vistoria Periódica': 170,
            'Vistoria de conferências diversas': 120
        },
        'Residencial de 61 a 110 m²': {
            'Vistoria de entrada': 260,
            'Vistoria de saída': 320,
            'Vistoria fotográfica (registro)': 190,
            'Vistoria de entrega de chaves': 290,
            'Vistoria de recebimento para venda': 290,
            'Vistoria Periódica': 210,
            'Vistoria de conferências diversas': 150
        },
        'Residencial de 111 a 180 m²': {
            'Vistoria de entrada': 320,
            'Vistoria de saída': 380,
            'Vistoria fotográfica (registro)': 240,
            'Vistoria de entrega de chaves': 350,
            'Vistoria de recebimento para venda': 350,
            'Vistoria Periódica': 290,
            'Vistoria de conferências diversas': 190
        },
        'Residencial acima de 180 m²': 'Sob análise'
    },
    Comercial: {
        'Comercial até 80 m²': {
            'Vistoria de entrada': 320,
            'Vistoria de saída': 380,
            'Vistoria fotográfica (registro)': 230,
            'Vistoria de entrega de chaves': 350,
            'Vistoria de recebimento para venda': 350,
            'Vistoria Periódica': 280,
            'Vistoria de conferências diversas': 180
        },
        'Comercial de 81 a 150 m²': {
            'Vistoria de entrada': 420,
            'Vistoria de saída': 490,
            'Vistoria fotográfica (registro)': 310,
            'Vistoria de entrega de chaves': 450,
            'Vistoria de recebimento para venda': 450,
            'Vistoria Periódica': 360,
            'Vistoria de conferências diversas': 230
        },
        'Comercial de 151 a 300 m²': {
            'Vistoria de entrada': 580,
            'Vistoria de saída': 690,
            'Vistoria fotográfica (registro)': 430,
            'Vistoria de entrega de chaves': 630,
            'Vistoria de recebimento para venda': 630,
            'Vistoria Periódica': 480,
            'Vistoria de conferências diversas': 320
        },
        'Comercial acima de 300 m²': 'Sob análise'
    },
    Terreno: {
        'Terreno até 360 m²': {
            'Vistoria de entrada': 180,
            'Vistoria de saída': 230,
            'Vistoria fotográfica (registro)': 130,
            'Vistoria de recebimento para venda': 210,
            'Vistoria Periódica': 140,
            'Vistoria de conferências diversas': 100
        },
        'Terreno de 361 a 700 m²': {
            'Vistoria de entrada': 220,
            'Vistoria de saída': 280,
            'Vistoria fotográfica (registro)': 160,
            'Vistoria de recebimento para venda': 250,
            'Vistoria Periódica': 170,
            'Vistoria de conferências diversas': 120
        },
        'Terreno de 701 a 1.200 m²': {
            'Vistoria de entrada': 290,
            'Vistoria de saída': 350,
            'Vistoria fotográfica (registro)': 210,
            'Vistoria de recebimento para venda': 320,
            'Vistoria Periódica': 240,
            'Vistoria de conferências diversas': 160
        },
        'Terreno acima de 1.200 m²': 'Sob análise'
    }
};

// ========================================
// GLOSSÁRIOS DINÂMICOS
// ========================================

const GLOSSARIOS = {
    tipologias: {
        Residencial: [
            'Apartamento Tipo', 'Cobertura (Penthouse)', 'Apartamento Garden',
            'Studio / Loft', 'Duplex / Triplex', 'Flat / Apart-hotel',
            'Casa de Rua', 'Casa em Condomínio', 'Sobrado', 'Casa Térrea',
            'Edícula', 'Área Externa Privativa', 'Infraestrutura de Lazer Privativa'
        ],
        Comercial: [
            'Sala Comercial', 'Laje Corporativa', 'Consultório', 'Coworking',
            'Loja de Rua', 'Loja de Shopping / Galeria', 'Pavilhão / Showroom',
            'Galpão Logístico', 'Galpão Industrial', 'Box / Self Storage',
            'Prédio Inteiro (Monousuário)', 'Imóvel Comercial com Residência (Misto)'
        ],
        Terreno: [
            'Lote Urbano (Rua/Aberto)', 'Lote em Condomínio',
            'Área Industrial/Comercial', 'Gleba/Área Rural'
        ]
    },
    ambientes: {
        Residencial: [
            'Hall de Entrada', 'Sala de Estar / Living', 'Sala de Jantar',
            'Banheiro Social / Lavabo', 'Varanda / Sacada Gourmet',
            'Circulação / Corredor', 'Dormitórios (Simples)', 'Suíte', 'Closet',
            'Copa', 'Cozinha', 'Área de Serviço / Lavanderia', 'Despensa',
            'Dependência de Empregada', 'Escritório / Home Office', 'Home Theater',
            'Terraço Técnico (ar-condicionado)', 'Espaço Garden / Quintal',
            'Piscina / Deck', 'Garagem / Estacionamento'
        ],
        Comercial: [
            'Recepção / Hall de Entrada', 'Sala de Espera', 'Showroom / Salão de Vendas',
            'Espaços de Trabalho', 'Salas de Reunião', 'Gabinetes / Salas de Diretoria',
            'Copa / Refeitório', 'Sala de TI / CPD (Servidores)',
            'Casa de Máquinas / Subestação', 'Depósito de Material de Limpeza',
            'Arquivo / Almoxarifado', 'Sanitários Públicos / Clientes',
            'Sanitários PNE', 'Vestiários', 'Doca de Carga e Descarga',
            'Estacionamento / Garagem', 'Espaço de Lixo / Resíduos'
        ],
        Terreno: [
            'Setor Frontal (Testada)', 'Setor Perimetral (Divisas)',
            'Setor de Platô', 'Setor de Declive/Aclive', 'Setor de Vegetação / APP'
        ]
    },
    observacoes: {
        Residencial: [
            'Pintura', 'Revestimentos Cerâmicos/Pedras', 'Pisos Laminados/Madeira/Rodapés',
            'Esquadrias', 'Vidros', 'Ferragens', 'Vazamentos', 'Escoamento',
            'Louças e Metais', 'Pontos de Energia', 'Iluminação', 'Ar-condicionado',
            'Fissuras/Trincas', 'Umidade Ascendente', 'Infiltração de Teto', 'Bancadas'
        ],
        Comercial: [
            'Quadros de Carga', 'Rede de Dados', 'Iluminação Industrial/Comercial',
            'Luzes de emergência (obrigatórias)', 'Extintores', 'Mangueiras',
            'Sinalização fotoluminescente', 'Sprinklers (detectores de fumaça)',
            'Rampas', 'Piso tátil', 'Barras de apoio /Sanitários PNE',
            'Portas corta-fogo', 'Climatização e Ventilação', 'Cortinas de Ar',
            'Exaustão Mecânica', 'Pisos Técnicos', 'Pavimentação Industrial',
            'Divisórias', 'Isolamento acústico', 'Vitrinas',
            'Portas de Enrolar/Automáticas (motores)', 'Fachadas', 'Docas',
            'Pé-direito', 'Pintura', 'Revestimentos Cerâmicos/Pedras',
            'Pisos Laminados/Madeira/Rodapés', 'Esquadrias', 'Vidros', 'Ferragens',
            'Vazamentos', 'Escoamento', 'Louças e Metais', 'Pontos de Energia',
            'Iluminação', 'Ar-condicionado', 'Fissuras/Trincas', 'Umidade Ascendente',
            'Infiltração de Teto', 'Bancadas'
        ],
        Terreno: [
            'Fechamento (cercamento)', 'Confrontantes', 'Invasões/Ocupações/Descartes',
            'Relevo', 'Encostas/Erosões/Deslizamento', 'Tipo de Solo',
            'Cobertura Vegetal', 'Limpeza', 'Cursos d\'Água', 'Acesso Viário',
            'Redes de Utilidades', 'Servidões', 'Estruturas Remanescentes',
            'Entulho e Contaminação'
        ]
    }
};

// Sugestões simplificadas (top 20 mais comuns)
const SUGESTOES_AUTOMATICAS = {
    'Pintura': ['Boa conservação', 'Descascamento', 'Manchas', 'Mofo'],
    'Vazamentos': ['Ponto de água', 'Infiltração ativa', 'Mancha antiga'],
    'Extintores': ['Vencido', 'Carga OK', 'Sem sinalização', 'Pressão baixa'],
    'Pisos Técnicos': ['Placa instável', 'Fiação desorganizada', 'Acabamento preservado'],
    'Fechamento (cercamento)': ['Íntegro', 'Com Fissuras', 'Inclinado', 'Ausente'],
    'Tipo de Solo': ['Argiloso', 'Arenoso', 'Pedregoso', 'Contaminado'],
    'Fissuras/Trincas': ['Estrutural', 'Superficial', 'Ativa', 'Estabilizada'],
    'Iluminação': ['Funcional', 'Pontos queimados', 'Interruptor defeituoso'],
    'Esquadrias': ['Bom estado', 'Vidro trincado', 'Fechadura danificada', 'Empenada']
};

// ========================================
// FAIXAS DE METRAGEM POR TIPO
// ========================================

const FAIXAS_METRAGEM = {
    Residencial: [
        'Residencial até 60 m²',
        'Residencial de 61 a 110 m²',
        'Residencial de 111 a 180 m²',
        'Residencial acima de 180 m²'
    ],
    Comercial: [
        'Comercial até 80 m²',
        'Comercial de 81 a 150 m²',
        'Comercial de 151 a 300 m²',
        'Comercial acima de 300 m²'
    ],
    Terreno: [
        'Terreno até 360 m²',
        'Terreno de 361 a 700 m²',
        'Terreno de 701 a 1.200 m²',
        'Terreno acima de 1.200 m²'
    ]
};

// ========================================
// UTILITÁRIOS
// ========================================

// Formatar data brasileira
function formatarDataBR(date) {
    const d = new Date(date);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const seg = String(d.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${ano} - ${hora}:${min}:${seg}`;
}

// Formatar moeda brasileira
function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

// Validar coordenadas GPS (Brasil)
function validarCoordenadas(lat, lon) {
    const BRASIL_BOUNDS = {
        latMin: -33.75, latMax: 5.27,
        lonMin: -73.99, lonMax: -34.79
    };
    
    if (lat < BRASIL_BOUNDS.latMin || lat > BRASIL_BOUNDS.latMax ||
        lon < BRASIL_BOUNDS.lonMin || lon > BRASIL_BOUNDS.lonMax) {
        alert('⚠️ GPS INVÁLIDO!\nCoordenadas fora do Brasil.\nTente novamente.');
        return false;
    }
    return true;
}

// Detectar horário noturno (18h - 8h)
function isHorarioNoturno(date) {
    const hora = new Date(date).getHours();
    return hora >= 18 || hora < 8;
}

// Debounce para otimização
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Gerar ID único
function gerarID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Salvar no localStorage com fallback
function salvarLocalStorage(chave, valor) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave) || '[]');
        if (!dados.includes(valor)) {
            dados.push(valor);
            localStorage.setItem(chave, JSON.stringify(dados));
        }
    } catch (e) {
        console.warn('Erro ao salvar localStorage:', e);
    }
}

// Obter dados do localStorage
function obterLocalStorage(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave) || '[]');
    } catch (e) {
        return [];
    }
}

// Converter imagem para Base64
function imagemParaBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Converter coordenadas para endereço (cache offline)
async function coordenadasParaEndereco(lat, lon) {
    // Tentar API de geocoding reverso (se online)
    if (navigator.onLine) {
        try {
            // Usar API gratuita (Nominatim - OpenStreetMap)
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'VistoriaImobiliariaApp/1.0' }
            });
            const data = await response.json();
            
            if (data.display_name) {
                return data.display_name;
            }
        } catch (e) {
            console.warn('Erro no geocoding:', e);
        }
    }
    
    // Fallback: apenas coordenadas
    return `Lat: ${lat.toFixed(4)} | Lon: ${lon.toFixed(4)}`;
}

// ========================================
// INDEXEDDB - GESTÃO DE DADOS OFFLINE
// ========================================

async function inicializarDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            STATE.db = request.result;
            resolve(request.result);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Object Store para vistorias
            if (!db.objectStoreNames.contains('vistorias')) {
                const vistoriasStore = db.createObjectStore('vistorias', { keyPath: 'id' });
                vistoriasStore.createIndex('timestamp', 'timestamp', { unique: false });
                vistoriasStore.createIndex('status', 'status', { unique: false });
            }
            
            // Object Store para fotos
            if (!db.objectStoreNames.contains('fotos')) {
                const fotosStore = db.createObjectStore('fotos', { keyPath: 'id' });
                fotosStore.createIndex('vistoriaId', 'vistoriaId', { unique: false });
                fotosStore.createIndex('blocoId', 'blocoId', { unique: false });
            }
        };
    });
}

// Salvar vistoria no IndexedDB
async function salvarVistoriaDB(vistoria) {
    if (!STATE.db) await inicializarDB();
    
    return new Promise((resolve, reject) => {
        const transaction = STATE.db.transaction(['vistorias'], 'readwrite');
        const store = transaction.objectStore('vistorias');
        const request = store.put(vistoria);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Salvar foto no IndexedDB
async function salvarFotoDB(foto) {
    if (!STATE.db) await inicializarDB();
    
    return new Promise((resolve, reject) => {
        const transaction = STATE.db.transaction(['fotos'], 'readwrite');
        const store = transaction.objectStore('fotos');
        const request = store.put(foto);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Deletar foto do IndexedDB
async function deletarFotoDB(fotoId) {
    if (!STATE.db) await inicializarDB();
    
    return new Promise((resolve, reject) => {
        const transaction = STATE.db.transaction(['fotos'], 'readwrite');
        const store = transaction.objectStore('fotos');
        const request = store.delete(fotoId);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Limpar vistorias antigas (manter apenas últimas 2)
async function limparVistoriasAntigas() {
    if (!STATE.db) await inicializarDB();
    
    return new Promise((resolve, reject) => {
        const transaction = STATE.db.transaction(['vistorias', 'fotos'], 'readwrite');
        const vistoriasStore = transaction.objectStore('vistorias');
        const fotosStore = transaction.objectStore('fotos');
        
        const request = vistoriasStore.getAll();
        
        request.onsuccess = () => {
            const vistorias = request.result;
            const ordenadas = vistorias.sort((a, b) => b.timestamp - a.timestamp);
            
            // Deletar vistorias antigas (exceto últimas 2)
            for (let i = 2; i < ordenadas.length; i++) {
                vistoriasStore.delete(ordenadas[i].id);
                
                // Deletar fotos associadas
                const fotoIndex = fotosStore.index('vistoriaId');
                const fotoRequest = fotoIndex.openCursor(IDBKeyRange.only(ordenadas[i].id));
                
                fotoRequest.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        fotosStore.delete(cursor.primaryKey);
                        cursor.continue();
                    }
                };
            }
            
            console.log(`✅ Limpeza concluída. ${Math.max(0, ordenadas.length - 2)} vistoria(s) removida(s)`);
            resolve();
        };
        
        request.onerror = () => reject(request.error);
    });
}

// ========================================
// GESTÃO DE BATERIA E MODO ECONOMIA
// ========================================

async function monitorarBateria() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            
            const atualizarStatusBateria = () => {
                const nivel = Math.round(battery.level * 100);
                const carregando = battery.charging ? '🔌' : '🔋';
                document.getElementById('battery-status').textContent = `${carregando} ${nivel}%`;
                
                // Ativar modo ultra economia se bateria < 20%
                if (nivel < 20 && !STATE.modoUltraEconomia) {
                    ativarModoUltraEconomia();
                }
            };
            
            atualizarStatusBateria();
            battery.addEventListener('levelchange', atualizarStatusBateria);
            battery.addEventListener('chargingchange', atualizarStatusBateria);
        } catch (e) {
            console.warn('API de Bateria não suportada');
        }
    }
}

function ativarModoUltraEconomia() {
    STATE.modoUltraEconomia = true;
    document.body.classList.add('ultra-economia');
    
    // Ajustar configurações
    CONFIG.JPEG_QUALITY = CONFIG.JPEG_QUALITY_ECONOMIA;
    CONFIG.THUMBNAIL_SIZE = CONFIG.THUMBNAIL_SIZE_ECONOMIA;
    CONFIG.AUTO_SAVE_INTERVAL = CONFIG.AUTO_SAVE_INTERVAL_ECONOMIA;
    
    alert('⚡ MODO ULTRA ECONOMIA ATIVADO\n\n' +
          '• Compressão de fotos aumentada\n' +
          '• Miniaturas reduzidas\n' +
          '• Animações desabilitadas\n' +
          '• Auto-save a cada 10s');
    
    console.log('⚡ Modo Ultra Economia ATIVADO');
}

// ========================================
// GESTÃO DE ARMAZENAMENTO
// ========================================

async function verificarEspacoArmazenamento() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const { usage, quota } = await navigator.storage.estimate();
            const percentualUsado = (usage / quota) * 100;
            const mbUsado = (usage / 1024 / 1024).toFixed(1);
            const mbTotal = (quota / 1024 / 1024).toFixed(1);
            
            document.getElementById('storage-status').textContent = 
                `💾 ${mbUsado}/${mbTotal} MB (${percentualUsado.toFixed(0)}%)`;
            
            if (percentualUsado > 90) {
                alert('⚠️ MEMÓRIA CHEIA (90%)\n\nLibere espaço no dispositivo antes de continuar!');
                return false;
            }
            
            return true;
        } catch (e) {
            console.warn('API de Storage não suportada');
            return true;
        }
    }
    return true;
}

// ========================================
// STATUS DE REDE
// ========================================

function atualizarStatusRede() {
    const online = navigator.onLine;
    const statusEl = document.getElementById('network-status');
    statusEl.textContent = online ? '🟢 Online' : '🔴 Offline';
    statusEl.style.color = online ? '#2D6A4F' : '#C44536';
}

window.addEventListener('online', atualizarStatusRede);
window.addEventListener('offline', atualizarStatusRede);

// ========================================
// CHECK-IN COM GPS
// ========================================

let watchID = null;

async function iniciarCheckin() {
    const btnCheckin = document.getElementById('btn-checkin');
    const gpsStatus = document.querySelector('.gps-status p');
    
    if (!navigator.geolocation) {
        alert('❌ GPS não disponível neste dispositivo');
        return;
    }
    
    // Verificar espaço em disco
    const espacoOK = await verificarEspacoArmazenamento();
    if (!espacoOK) return;
    
    gpsStatus.textContent = '📍 Obtendo localização GPS...';
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };
    
    watchID = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            // Validar coordenadas
            if (!validarCoordenadas(latitude, longitude)) {
                return;
            }
            
            STATE.coordenadas = { latitude, longitude };
            gpsStatus.textContent = `📍 GPS pronto: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            btnCheckin.disabled = false;
        },
        (error) => {
            console.error('Erro GPS:', error);
            gpsStatus.textContent = '⚠️ Erro ao obter GPS. Tente novamente.';
            
            // Retry após 3 segundos
            setTimeout(iniciarCheckin, 3000);
        },
        options
    );
}

async function realizarCheckin() {
    const now = new Date();
    STATE.timestampCheckin = now.getTime();
    STATE.adicionalNoturno = isHorarioNoturno(now);
    STATE.checkinRealizado = true;
    
    // Parar watchPosition
    if (watchID) {
        navigator.geolocation.clearWatch(watchID);
        watchID = null;
    }
    
    // Obter endereço (tentativa)
    const endereco = await coordenadasParaEndereco(
        STATE.coordenadas.latitude,
        STATE.coordenadas.longitude
    );
    
    // Atualizar UI
    document.getElementById('checkin-pending').style.display = 'none';
    document.getElementById('checkin-complete').style.display = 'block';
    document.getElementById('checkin-coords').textContent = 
        `Lat: ${STATE.coordenadas.latitude.toFixed(4)} | Lon: ${STATE.coordenadas.longitude.toFixed(4)}`;
    document.getElementById('checkin-datetime').textContent = formatarDataBR(now);
    document.getElementById('checkin-noturno').textContent = 
        STATE.adicionalNoturno ? 'SIM (+30%)' : 'NÃO';
    
    // Iniciar cronômetro de tempo de espera
    iniciarCronometroEspera();
    
    // Desbloquear seções
    desbloquearSecoes();
    
    // Salvar no estado
    STATE.vistoriaAtual.id = gerarID();
    STATE.vistoriaAtual.timestamp = STATE.timestampCheckin;
    STATE.vistoriaAtual.coordenadas = STATE.coordenadas;
    STATE.vistoriaAtual.enderecoGPS = endereco;
    
    await salvarAutoSave();
    
    console.log('✅ Check-in realizado:', STATE.vistoriaAtual);
}

function iniciarCronometroEspera() {
    const tempoEl = document.getElementById('tempo-espera');
    const noteEl = document.getElementById('tempo-note');
    
    STATE.intervaloCronometro = setInterval(() => {
        const agora = Date.now();
        const diff = agora - STATE.timestampCheckin;
        const minutos = Math.floor(diff / 60000);
        const segundos = Math.floor((diff % 60000) / 1000);
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        
        tempoEl.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        
        // Alerta aos 20 minutos (se ainda não tirou foto)
        if (minutos >= CONFIG.TEMPO_ESPERA_MINUTOS && !STATE.timestampPrimeiraFoto) {
            if (!STATE.adicionalTempoEspera) {
                STATE.adicionalTempoEspera = true;
                noteEl.textContent = `⚠️ TEMPO DE ESPERA EXCEDIDO (+15%)`;
                noteEl.style.display = 'block';
            }
        }
    }, 1000);
}

function desbloquearSecoes() {
    document.querySelectorAll('.section-card.locked').forEach(section => {
        section.classList.remove('locked');
        section.style.display = 'block';
    });
}

// ========================================
// IMPEDIMENTO DE ACESSO
// ========================================

function abrirModalImpedimento() {
    const valorBase = calcularValorBase();
    const valorImpedimento = valorBase === 'Sob análise' ? 0 : valorBase * 0.5;
    
    document.getElementById('valor-impedimento').textContent = 
        valorBase === 'Sob análise' ? 'Sob análise' : formatarMoeda(valorImpedimento);
    document.getElementById('modal-impedimento').style.display = 'flex';
}

function fecharModalImpedimento() {
    document.getElementById('modal-impedimento').style.display = 'none';
}

async function confirmarImpedimento() {
    const motivo = document.getElementById('motivo-impedimento').value;
    const motivoOutro = document.getElementById('motivo-outro').value;
    const motivoFinal = motivo === 'Outro' ? motivoOutro : motivo;
    
    if (motivo === 'Outro' && !motivoOutro.trim()) {
        alert('Por favor, especifique o motivo');
        return;
    }
    
    STATE.impedimentoAcesso = true;
    STATE.vistoriaAtual.impedimento = {
        motivo: motivoFinal,
        timestamp: Date.now()
    };
    
    fecharModalImpedimento();
    
    // Gerar Auto de Constatação (PDF simplificado)
    await gerarAutoImpedimento();
    
    alert('✅ Auto de Constatação de Impedimento gerado!\n\nVocê pode enviar o documento ao contratante.');
}

// ========================================
// COMPRESSÃO E PROCESSAMENTO DE FOTOS
// ========================================

async function comprimirImagem(file, qualidade = CONFIG.JPEG_QUALITY) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.getElementById('photo-canvas');
                const ctx = canvas.getContext('2d');
                
                // Calcular dimensões (max 1280x720)
                let width = img.width;
                let height = img.height;
                const maxWidth = CONFIG.CAPTURE_WIDTH;
                const maxHeight = CONFIG.CAPTURE_HEIGHT;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Desenhar imagem
                ctx.drawImage(img, 0, 0, width, height);
                
                // Aplicar carimbo GPS
                aplicarCarimboGPS(ctx, width, height);
                
                // Converter para Blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Falha ao comprimir imagem'));
                        }
                    },
                    'image/jpeg',
                    qualidade
                );
            };
            
            img.onerror = () => reject(new Error('Falha ao carregar imagem'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
        reader.readAsDataURL(file);
    });
}

async function gerarThumbnail(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.getElementById('thumbnail-canvas');
                const ctx = canvas.getContext('2d');
                const size = CONFIG.THUMBNAIL_SIZE;
                
                canvas.width = size;
                canvas.height = size;
                
                // Crop central quadrado
                const sourceSize = Math.min(img.width, img.height);
                const sourceX = (img.width - sourceSize) / 2;
                const sourceY = (img.height - sourceSize) / 2;
                
                ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
                
                canvas.toBlob(
                    (thumbBlob) => {
                        if (thumbBlob) {
                            resolve(thumbBlob);
                        } else {
                            reject(new Error('Falha ao gerar thumbnail'));
                        }
                    },
                    'image/jpeg',
                    STATE.modoUltraEconomia ? 0.5 : 0.6
                );
            };
            
            img.onerror = () => reject(new Error('Falha ao carregar para thumbnail'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('Falha ao ler blob'));
        reader.readAsDataURL(blob);
    });
}

async function aplicarCarimboGPS(ctx, width, height) {
    const timestamp = Date.now();
    const data = formatarDataBR(timestamp);
    const coords = STATE.coordenadas;
    const endereco = STATE.vistoriaAtual.endereco || 'Endereço não informado';
    
    // Fundo semitransparente
    const padding = 10;
    const lineHeight = 16;
    const rectHeight = lineHeight * 3 + padding * 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height - rectHeight, width, rectHeight);
    
    // Texto branco
    ctx.fillStyle = 'white';
    ctx.font = '12px Montserrat, sans-serif';
    ctx.textAlign = 'left';
    
    let y = height - rectHeight + padding + 12;
    
    // Linha 1: Endereço
    ctx.fillText(endereco.substring(0, 60), padding, y);
    y += lineHeight;
    
    // Linha 2: Data/Hora
    ctx.fillText(data, padding, y);
    y += lineHeight;
    
    // Linha 3: Coordenadas
    ctx.fillText(`Lat: ${coords.latitude.toFixed(4)} | Lon: ${coords.longitude.toFixed(4)}`, padding, y);
    
    // Logo no canto direito (pequeno)
    // TODO: Adicionar logo em base64 aqui
}

// ========================================
// GESTÃO DE BLOCOS DE VISTORIA
// ========================================

function adicionarBlocoVistoria() {
    const tipo = STATE.vistoriaAtual.tipoImovel;
    if (!tipo) {
        alert('Selecione o tipo de imóvel primeiro');
        return;
    }
    
    const blocoId = gerarID();
    const container = document.getElementById('blocos-vistoria');
    
    const labelAmbiente = tipo === 'Residencial' ? 'Cômodo:' : 
                         tipo === 'Comercial' ? 'Espaço:' : 'Setor:';
    
    const bloco = document.createElement('div');
    bloco.className = 'bloco-vistoria';
    bloco.dataset.blocoId = blocoId;
    
    bloco.innerHTML = `
        <div class="bloco-header">
            <span class="bloco-label">${labelAmbiente}</span>
            <span class="foto-counter">Nº de fotos: <span class="contador-bloco">0</span></span>
        </div>
        
        <div class="form-group">
            <input type="text" class="form-input ambiente-input" list="ambientes-${blocoId}" 
                   placeholder="Digite ou selecione...">
            <datalist id="ambientes-${blocoId}"></datalist>
        </div>
        
        <div class="form-group">
            <label>2b. Observações:</label>
            <input type="text" class="form-input observacoes-input" list="observacoes-${blocoId}"
                   placeholder="Digite ou selecione...">
            <datalist id="observacoes-${blocoId}"></datalist>
            <div class="sugestoes-container" data-bloco="${blocoId}"></div>
        </div>
        
        <div class="fotos-acoes">
            <button class="btn-secondary btn-foto" data-bloco="${blocoId}">
                <span class="btn-icon">📷</span> FOTOS
            </button>
            <button class="btn-secondary btn-arquivos" data-bloco="${blocoId}">
                <span class="btn-icon">📁</span> ARQUIVOS
            </button>
        </div>
        
        <div class="galeria-fotos" data-bloco="${blocoId}"></div>
    `;
    
    container.appendChild(bloco);
    
    // Popular datalists
    popularDatalist(`ambientes-${blocoId}`, GLOSSARIOS.ambientes[tipo]);
    popularDatalist(`observacoes-${blocoId}`, GLOSSARIOS.observacoes[tipo]);
    
    // Event listeners
    const ambienteInput = bloco.querySelector('.ambiente-input');
    const observacoesInput = bloco.querySelector('.observacoes-input');
    
    ambienteInput.addEventListener('input', debounce(salvarAutoSave, 500));
    observacoesInput.addEventListener('input', (e) => {
        debounce(salvarAutoSave, 500)();
        mostrarSugestoes(e.target.value, blocoId);
    });
    
    bloco.querySelector('.btn-foto').addEventListener('click', () => abrirCamera(blocoId));
    bloco.querySelector('.btn-arquivos').addEventListener('click', () => abrirArquivos(blocoId));
    
    // Adicionar ao estado
    STATE.vistoriaAtual.blocos.push({
        id: blocoId,
        ambiente: '',
        observacoes: '',
        fotos: []
    });
    
    return blocoId;
}

function popularDatalist(id, opcoes) {
    const datalist = document.getElementById(id);
    datalist.innerHTML = opcoes.map(opt => `<option value="${opt}">`).join('');
}

function mostrarSugestoes(texto, blocoId) {
    const container = document.querySelector(`.sugestoes-container[data-bloco="${blocoId}"]`);
    container.innerHTML = '';
    
    const sugestoes = SUGESTOES_AUTOMATICAS[texto];
    if (sugestoes) {
        sugestoes.forEach(sug => {
            const chip = document.createElement('span');
            chip.className = 'sugestao-chip';
            chip.textContent = sug;
            chip.addEventListener('click', () => {
                const input = container.previousElementSibling;
                input.value += (input.value ? ', ' : '') + sug;
                salvarAutoSave();
            });
            container.appendChild(chip);
        });
    }
}

// ========================================
// CAPTURA E UPLOAD DE FOTOS
// ========================================

function abrirCamera(blocoId) {
    if (STATE.totalFotos >= CONFIG.MAX_PHOTOS) {
        alert(`⚠️ Limite de ${CONFIG.MAX_PHOTOS} fotos atingido!`);
        return;
    }
    
    const input = document.getElementById('camera-input');
    input.dataset.blocoId = blocoId;
    input.click();
}

function abrirArquivos(blocoId) {
    if (STATE.totalFotos >= CONFIG.MAX_PHOTOS) {
        alert(`⚠️ Limite de ${CONFIG.MAX_PHOTOS} fotos atingido!`);
        return;
    }
    
    const input = document.getElementById('file-input');
    input.dataset.blocoId = blocoId;
    input.click();
}

async function processarFotos(files, blocoId) {
    // Registrar primeira foto (para tempo de espera)
    if (!STATE.timestampPrimeiraFoto && files.length > 0) {
        STATE.timestampPrimeiraFoto = Date.now();
    }
    
    for (const file of files) {
        if (STATE.totalFotos >= CONFIG.MAX_PHOTOS) {
            alert(`⚠️ Limite de ${CONFIG.MAX_PHOTOS} fotos atingido!`);
            break;
        }
        
        try {
            // Comprimir foto
            const fotoComprimida = await comprimirImagem(file);
            const thumbnail = await gerarThumbnail(fotoComprimida);
            
            // Converter para Base64
            const fotoBase64 = await imagemParaBase64(fotoComprimida);
            const thumbBase64 = await imagemParaBase64(thumbnail);
            
            // Criar objeto foto
            const foto = {
                id: gerarID(),
                vistoriaId: STATE.vistoriaAtual.id,
                blocoId: blocoId,
                timestamp: Date.now(),
                fotoBase64: fotoBase64,
                thumbnailBase64: thumbBase64,
                coordenadas: STATE.coordenadas
            };
            
            // Salvar no IndexedDB
            await salvarFotoDB(foto);
            
            // Adicionar ao estado
            const bloco = STATE.vistoriaAtual.blocos.find(b => b.id === blocoId);
            if (bloco) {
                bloco.fotos.push(foto);
            }
            
            // Renderizar thumbnail
            renderizarThumbnail(foto, blocoId);
            
            // Atualizar contadores
            STATE.totalFotos++;
            atualizarContadores();
            
            // Liberar memória
            URL.revokeObjectURL(fotoBase64);
            URL.revokeObjectURL(thumbBase64);
            
        } catch (err) {
            console.error('Erro ao processar foto:', err);
            alert('Erro ao processar foto. Tente novamente.');
        }
    }
    
    await salvarAutoSave();
}

function renderizarThumbnail(foto, blocoId) {
    const galeria = document.querySelector(`.galeria-fotos[data-bloco="${blocoId}"]`);
    
    const div = document.createElement('div');
    div.className = 'foto-thumbnail';
    div.dataset.fotoId = foto.id;
    
    div.innerHTML = `
        <img src="${foto.thumbnailBase64}" alt="Foto">
        <button class="delete-btn" data-foto-id="${foto.id}">×</button>
    `;
    
    // Event listeners
    div.querySelector('img').addEventListener('click', () => visualizarFoto(foto.id));
    div.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deletarFoto(foto.id, blocoId);
    });
    
    galeria.appendChild(div);
}

function visualizarFoto(fotoId) {
    // TODO: Implementar modal de visualização
    console.log('Visualizar foto:', fotoId);
}

async function deletarFoto(fotoId, blocoId) {
    if (!confirm('Deseja realmente deletar esta foto?')) return;
    
    try {
        // Remover do IndexedDB
        await deletarFotoDB(fotoId);
        
        // Remover do estado
        const bloco = STATE.vistoriaAtual.blocos.find(b => b.id === blocoId);
        if (bloco) {
            bloco.fotos = bloco.fotos.filter(f => f.id !== fotoId);
        }
        
        // Remover da UI
        const thumbnail = document.querySelector(`.foto-thumbnail[data-foto-id="${fotoId}"]`);
        if (thumbnail) thumbnail.remove();
        
        // Atualizar contadores
        STATE.totalFotos--;
        atualizarContadores();
        
        await salvarAutoSave();
        
    } catch (err) {
        console.error('Erro ao deletar foto:', err);
        alert('Erro ao deletar foto');
    }
}

function atualizarContadores() {
    // Atualizar contador global
    document.getElementById('total-fotos-global').textContent = STATE.totalFotos;
    
    // Atualizar contadores por bloco
    STATE.vistoriaAtual.blocos.forEach(bloco => {
        const contador = document.querySelector(`[data-bloco-id="${bloco.id}"] .contador-bloco`);
        if (contador) {
            contador.textContent = bloco.fotos.length;
        }
    });
}

// ========================================
// ASSINATURAS DIGITAIS
// ========================================

function adicionarAssinatura() {
    const container = document.getElementById('assinaturas-clientes');
    const assinaturaId = gerarID();
    
    const div = document.createElement('div');
    div.className = 'assinatura-cliente-card';
    div.dataset.assinaturaId = assinaturaId;
    
    div.innerHTML = `
        <div class="form-group">
            <label>Perfil do Assinante:</label>
            <select class="form-select perfil-select">
                <option value="Proprietário">Proprietário</option>
                <option value="Locatário">Locatário</option>
                <option value="Comprador">Comprador</option>
                <option value="Corretor de Imóveis">Corretor de Imóveis</option>
                <option value="Responsável">Responsável</option>
                <option value="Representante Legal">Representante Legal</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Assinatura Digital:</label>
            <canvas class="signature-pad" width="400" height="200"></canvas>
        </div>
        
        <button class="btn-secondary btn-outline btn-limpar-assinatura">
            🗑️ Limpar Assinatura
        </button>
    `;
    
    container.appendChild(div);
    
    // Inicializar canvas de assinatura
    const canvas = div.querySelector('.signature-pad');
    inicializarPadAssinatura(canvas, assinaturaId);
    
    // Event listener limpar
    div.querySelector('.btn-limpar-assinatura').addEventListener('click', () => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    // Adicionar ao estado
    STATE.vistoriaAtual.assinaturas.push({
        id: assinaturaId,
        perfil: 'Proprietário',
        assinaturaBase64: null
    });
}

function inicializarPadAssinatura(canvas, assinaturaId) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#003366'; // Azul caneta
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    let desenhando = false;
    let ultimoX = 0;
    let ultimoY = 0;
    
    const iniciar = (e) => {
        desenhando = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        ultimoX = touch.clientX - rect.left;
        ultimoY = touch.clientY - rect.top;
    };
    
    const desenhar = (e) => {
        if (!desenhando) return;
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(ultimoX, ultimoY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        ultimoX = x;
        ultimoY = y;
    };
    
    const parar = () => {
        if (desenhando) {
            desenhando = false;
            salvarAssinatura(canvas, assinaturaId);
        }
    };
    
    // Touch events
    canvas.addEventListener('touchstart', iniciar);
    canvas.addEventListener('touchmove', desenhar);
    canvas.addEventListener('touchend', parar);
    
    // Mouse events
    canvas.addEventListener('mousedown', iniciar);
    canvas.addEventListener('mousemove', desenhar);
    canvas.addEventListener('mouseup', parar);
    canvas.addEventListener('mouseleave', parar);
}

function salvarAssinatura(canvas, assinaturaId) {
    const assinaturaBase64 = canvas.toDataURL('image/png');
    const assinatura = STATE.vistoriaAtual.assinaturas.find(a => a.id === assinaturaId);
    if (assinatura) {
        assinatura.assinaturaBase64 = assinaturaBase64;
    }
    salvarAutoSave();
}

// ========================================
// AUTO-SAVE E PERSISTÊNCIA
// ========================================

const salvarAutoSave = debounce(async () => {
    try {
        // Coletar dados do formulário
        STATE.vistoriaAtual.contratante = document.getElementById('contratante').value;
        STATE.vistoriaAtual.endereco = document.getElementById('endereco').value;
        STATE.vistoriaAtual.tipoImovel = document.getElementById('tipo-imovel').value;
        STATE.vistoriaAtual.tipologia = document.getElementById('tipologia').value;
        STATE.vistoriaAtual.modalidade = document.getElementById('modalidade').value;
        STATE.vistoriaAtual.faixaMetragem = document.getElementById('faixa-metragem').value;
        
        // Coletar dados dos blocos
        document.querySelectorAll('.bloco-vistoria').forEach(blocoEl => {
            const blocoId = blocoEl.dataset.blocoId;
            const bloco = STATE.vistoriaAtual.blocos.find(b => b.id === blocoId);
            if (bloco) {
                bloco.ambiente = blocoEl.querySelector('.ambiente-input').value;
                bloco.observacoes = blocoEl.querySelector('.observacoes-input').value;
            }
        });
        
        // Coletar perfis de assinaturas
        document.querySelectorAll('.assinatura-cliente-card').forEach(assEl => {
            const assId = assEl.dataset.assinaturaId;
            const ass = STATE.vistoriaAtual.assinaturas.find(a => a.id === assId);
            if (ass) {
                ass.perfil = assEl.querySelector('.perfil-select').value;
            }
        });
        
        // Salvar no IndexedDB
        await salvarVistoriaDB(STATE.vistoriaAtual);
        
        console.log('💾 Auto-save concluído');
        
    } catch (err) {
        console.error('Erro no auto-save:', err);
    }
}, CONFIG.AUTO_SAVE_INTERVAL);

// Prevenir perda de dados
window.addEventListener('beforeunload', (e) => {
    if (STATE.checkinRealizado && !STATE.vistoriaAtual.pdfBlob) {
        e.preventDefault();
        e.returnValue = 'Você tem dados não salvos. Deseja realmente sair?';
    }
});

// ========================================
// CÁLCULO DE HONORÁRIOS
// ========================================

function calcularValorBase() {
    const tipo = STATE.vistoriaAtual.tipoImovel;
    const modalidade = STATE.vistoriaAtual.modalidade;
    const faixa = STATE.vistoriaAtual.faixaMetragem;
    
    if (!tipo || !modalidade || !faixa) {
        return 0;
    }
    
    const tabela = TABELA_HONORARIOS[tipo];
    if (!tabela) return 0;
    
    const valores = tabela[faixa];
    if (!valores) return 0;
    
    if (valores === 'Sob análise') return 'Sob análise';
    
    return valores[modalidade] || 0;
}

function calcularValorTotal() {
    const valorBase = calcularValorBase();
    
    if (valorBase === 'Sob análise') {
        return 'Sob análise';
    }
    
    if (valorBase === 0) {
        return 0;
    }
    
    let total = valorBase;
    const adicionais = [];
    
    // Adicionais INDEPENDENTES (sobre valor base)
    if (STATE.adicionalNoturno) {
        const adicional = valorBase * 0.30;
        total += adicional;
        adicionais.push({ nome: 'Vistoria noturna (18h às 08h)', percentual: '30%', valor: adicional });
    }
    
    if (STATE.adicionalTempoEspera) {
        const adicional = valorBase * 0.15;
        total += adicional;
        adicionais.push({ nome: 'Tempo de Espera (>20min)', percentual: '15%', valor: adicional });
    }
    
    // Adicionais opcionais (checkboxes no PDF)
    // Estes serão calculados na geração do PDF
    
    return { valorBase, total, adicionais };
}

// ========================================
// VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
// ========================================

function validarFormulario() {
    const erros = [];
    
    if (!STATE.vistoriaAtual.contratante) erros.push('1a. Contratante');
    if (!STATE.vistoriaAtual.endereco) erros.push('1b. Endereço do Imóvel');
    if (!STATE.vistoriaAtual.tipoImovel) erros.push('1c. Tipo de Imóvel');
    if (!STATE.vistoriaAtual.modalidade) erros.push('1e. Modalidade');
    if (!STATE.vistoriaAtual.faixaMetragem) erros.push('1f. Faixa de Metragem');
    
    if (STATE.totalFotos === 0) erros.push('Nenhuma foto capturada');
    
    if (erros.length > 0) {
        alert(`⚠️ Campos obrigatórios não preenchidos:\n\n${erros.join('\n')}`);
        return false;
    }
    
    return true;
}

// ========================================
// GERAÇÃO DE PDF COM PROGRESS
// ========================================

async function gerarPDF() {
    if (!validarFormulario()) return;
    
    // Verificar espaço
    const espacoOK = await verificarEspacoArmazenamento();
    if (!espacoOK) return;
    
    // Mostrar overlay de progresso
    document.getElementById('pdf-overlay').style.display = 'flex';
    
    try {
        // Timeout de segurança
        const pdfPromise = gerarPDFInterno();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), CONFIG.PDF_TIMEOUT)
        );
        
        const pdfBlob = await Promise.race([pdfPromise, timeoutPromise]);
        
        STATE.vistoriaAtual.pdfBlob = pdfBlob;
        
        // Fechar overlay
        document.getElementById('pdf-overlay').style.display = 'none';
        
        // Habilitar botões de envio
        document.getElementById('btn-enviar-email').disabled = false;
        document.getElementById('btn-enviar-whatsapp').disabled = false;
        
        // Download automático
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Vistoria_${STATE.vistoriaAtual.endereco.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('✅ PDF gerado com sucesso!');
        
        // Criar backup JSON
        await criarBackupJSON();
        
        // Limpar vistorias antigas
        await limparVistoriasAntigas();
        
    } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        document.getElementById('pdf-overlay').style.display = 'none';
        
        if (err.message === 'Timeout') {
            alert('⚠️ PDF travado!\n\nTentando novamente em modo seguro...');
            // TODO: Implementar modo seguro com menor qualidade
        } else {
            alert('Erro ao gerar PDF. Tente novamente.');
        }
    }
}

async function gerarPDFInterno() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });
    
    let y = 25;
    const marginLeft = 20;
    const marginRight = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const usableWidth = pageWidth - marginLeft - marginRight;
    
    // TODO: Adicionar logo em base64
    // pdf.addImage(logoBase64, 'PNG', 55, y, 100, 30);
    // y += 40;
    
    // Título
    pdf.setFontSize(20);
    pdf.setTextColor(212, 165, 116);
    pdf.setFont(undefined, 'bold');
    pdf.text('LAUDO DE VISTORIA IMOBILIÁRIA', pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // Seção 1: Dados do Imóvel
    adicionarSecaoPDF(pdf, '1. DADOS DO IMÓVEL', y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(74, 74, 74);
    pdf.setFont(undefined, 'bold');
    pdf.text('1a. Contratante:', marginLeft, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(STATE.vistoriaAtual.contratante, marginLeft + 35, y);
    y += 7;
    
    pdf.setFont(undefined, 'bold');
    pdf.text('1b. Endereço do Imóvel:', marginLeft, y);
    pdf.setFont(undefined, 'normal');
    const linhasEndereco = pdf.splitTextToSize(STATE.vistoriaAtual.endereco, usableWidth - 45);
    pdf.text(linhasEndereco, marginLeft + 45, y);
    y += 7 * linhasEndereco.length;
    
    pdf.setFont(undefined, 'bold');
    pdf.text('1c. Tipo de Imóvel:', marginLeft, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(STATE.vistoriaAtual.tipoImovel, marginLeft + 35, y);
    y += 7;
    
    pdf.setFont(undefined, 'bold');
    pdf.text('1d. Tipologia:', marginLeft, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(STATE.vistoriaAtual.tipologia, marginLeft + 25, y);
    y += 7;
    
    pdf.setFont(undefined, 'bold');
    pdf.text('1e. Modalidade de Vistoria:', marginLeft, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(STATE.vistoriaAtual.modalidade, marginLeft + 55, y);
    y += 7;
    
    pdf.setFont(undefined, 'bold');
    pdf.text('1f. Faixa de Metragem:', marginLeft, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(STATE.vistoriaAtual.faixaMetragem, marginLeft + 42, y);
    y += 15;
    
    // Atualizar progresso
    atualizarProgresso(5, STATE.totalFotos);
    
    // Seção 2: Vistoria de Cômodos/Espaços/Setores
    const labelAmbiente = STATE.vistoriaAtual.tipoImovel === 'Residencial' ? 'CÔMODOS' :
                         STATE.vistoriaAtual.tipoImovel === 'Comercial' ? 'ESPAÇOS' : 'SETORES';
    
    adicionarSecaoPDF(pdf, `2. VISTORIA DE ${labelAmbiente}`, y);
    y += 10;
    
    // Processar blocos
    let fotoIndex = 0;
    for (const bloco of STATE.vistoriaAtual.blocos) {
        // Verificar espaço na página
        if (y > pageHeight - 80) {
            pdf.addPage();
            y = 25;
        }
        
        pdf.setFontSize(11);
        pdf.setTextColor(44, 44, 44);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${bloco.ambiente || 'Ambiente não especificado'}`, marginLeft, y);
        y += 7;
        
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        pdf.text('Observações:', marginLeft, y);
        const linhasObs = pdf.splitTextToSize(bloco.observacoes || 'Nenhuma', usableWidth - 30);
        pdf.text(linhasObs, marginLeft + 25, y);
        y += 5 * linhasObs.length + 5;
        
        // Adicionar fotos (2 por página)
        for (const foto of bloco.fotos) {
            if (y > pageHeight - 100) {
                pdf.addPage();
                y = 25;
            }
            
            // Carregar foto do IndexedDB
            const fotoData = foto.fotoBase64;
            
            // Adicionar imagem
            const imgWidth = usableWidth;
            const imgHeight = (imgWidth * 3) / 4; // Aspect ratio 4:3
            
            pdf.addImage(fotoData, 'JPEG', marginLeft, y, imgWidth, imgHeight, '', 'MEDIUM');
            y += imgHeight + 10;
            
            fotoIndex++;
            atualizarProgresso(5 + fotoIndex, STATE.totalFotos);
            
            // Aguardar um pouco para liberar memória
            if (fotoIndex % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        y += 5;
    }
    
    // Seção 3: Assinaturas
    if (y > pageHeight - 100) {
        pdf.addPage();
        y = 25;
    }
    
    adicionarSecaoPDF(pdf, '3. ASSINATURAS', y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('3a. Vistoriador:', marginLeft, y);
    y += 7;
    
    // TODO: Adicionar assinatura SVG do vistoriador
    pdf.setFont(undefined, 'italic');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 51, 102);
    pdf.text('Emilio Paulo Granata', marginLeft, y);
    y += 15;
    
    // Assinaturas de clientes
    for (const ass of STATE.vistoriaAtual.assinaturas) {
        if (y > pageHeight - 60) {
            pdf.addPage();
            y = 25;
        }
        
        pdf.setFontSize(10);
        pdf.setTextColor(74, 74, 74);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${ass.perfil}:`, marginLeft, y);
        y += 5;
        
        if (ass.assinaturaBase64) {
            pdf.addImage(ass.assinaturaBase64, 'PNG', marginLeft, y, 80, 20);
        }
        y += 25;
    }
    
    // Certificação de Autenticidade
    if (y > pageHeight - 50) {
        pdf.addPage();
        y = 25;
    }
    
    pdf.setFillColor(248, 249, 250);
    pdf.rect(marginLeft, y, usableWidth, 35, 'F');
    
    pdf.setDrawColor(212, 165, 116);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, y, marginLeft, y + 35);
    
    y += 7;
    pdf.setFontSize(9);
    pdf.setTextColor(44, 44, 44);
    pdf.setFont(undefined, 'bold');
    pdf.text('⚖️ CERTIFICAÇÃO DE AUTENTICIDADE', marginLeft + 3, y);
    
    y += 5;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(8);
    const textoCert = 'Este laudo de vistoria é um documento pericial inviolável, certificado pela identificação do Vistoriador Emilio Paulo Granata, contendo evidências fotográficas gravadas com coordenadas geográficas de precisão (GPS) e carimbo de data/hora, assegurando a integridade e a veracidade das condições do imóvel no ato da inspeção.';
    const linhasCert = pdf.splitTextToSize(textoCert, usableWidth - 6);
    pdf.text(linhasCert, marginLeft + 3, y);
    y += 40;
    
    // Seção 4: Valores (somente no PDF)
    if (y > pageHeight - 80) {
        pdf.addPage();
        y = 25;
    }
    
    adicionarSecaoPDF(pdf, '4. VALORES E HONORÁRIOS', y);
    y += 10;
    
    const calculo = calcularValorTotal();
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Valor Total:', marginLeft, y);
    pdf.setTextColor(212, 165, 116);
    pdf.setFontSize(16);
    pdf.text(typeof calculo === 'string' ? calculo : formatarMoeda(calculo.total), marginLeft + 30, y);
    y += 10;
    
    if (typeof calculo === 'object') {
        pdf.setFontSize(9);
        pdf.setTextColor(74, 74, 74);
        pdf.setFont(undefined, 'bold');
        pdf.text('Adicionais por Escopo:', marginLeft, y);
        y += 7;
        
        pdf.setFont(undefined, 'normal');
        pdf.text(`Valor Base: ${formatarMoeda(calculo.valorBase)}`, marginLeft + 5, y);
        y += 5;
        
        calculo.adicionais.forEach(ad => {
            pdf.text(`✓ ${ad.nome}: +${ad.percentual} (${formatarMoeda(ad.valor)})`, marginLeft + 5, y);
            y += 5;
        });
    }
    
    // Rodapé em todas as páginas
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Pág. ${String(i).padStart(2, '0')} de ${String(totalPages).padStart(2, '0')}`, 
                 pageWidth - marginRight, pageHeight - 10, { align: 'right' });
    }
    
    return pdf.output('blob');
}

function adicionarSecaoPDF(pdf, titulo, y) {
    pdf.setFontSize(14);
    pdf.setTextColor(212, 165, 116);
    pdf.setFont(undefined, 'bold');
    pdf.text(titulo, 20, y);
    
    pdf.setDrawColor(212, 165, 116);
    pdf.setLineWidth(0.3);
    pdf.line(20, y + 2, 190, y + 2);
}

function atualizarProgresso(atual, total) {
    const percent = Math.round((atual / total) * 100);
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('progress-percent').textContent = `${percent}%`;
    document.getElementById('current-photo').textContent = atual;
    document.getElementById('total-photos').textContent = total;
}

// ========================================
// BACKUP JSON
// ========================================

async function criarBackupJSON() {
    try {
        const backup = {
            versao: '1.0',
            timestamp: Date.now(),
            vistoria: STATE.vistoriaAtual
        };
        
        const json = JSON.stringify(backup);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `BACKUP_${STATE.vistoriaAtual.endereco.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('💾 Backup JSON criado');
    } catch (err) {
        console.error('Erro ao criar backup:', err);
    }
}

// ========================================
// ENVIO VIA EMAIL E WHATSAPP
// ========================================

async function enviarEmail() {
    const email = prompt('Digite o e-mail do destinatário:');
    if (!email) return;
    
    // Salvar para autocomplete
    salvarLocalStorage('emails', email);
    
    const assunto = `Relatório de Vistoria - ${STATE.vistoriaAtual.endereco}`;
    const corpo = `Olá, aqui vistoriador Emilio Paulo Granata. A vistoria do imóvel localizado à ${STATE.vistoriaAtual.endereco} foi concluída. Estou enviando o relatório em seguida.`;
    
    // Abrir cliente de email
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = mailtoLink;
    
    alert('📧 Cliente de e-mail aberto!\n\nAnexe o PDF manualmente.');
}

async function enviarWhatsApp() {
    const telefone = prompt('Digite o número do WhatsApp (com DDD):');
    if (!telefone) return;
    
    // Salvar para autocomplete
    salvarLocalStorage('telefones', telefone);
    
    const mensagem = `Olá, aqui vistoriador Emilio Paulo Granata. A vistoria do imóvel localizado à ${STATE.vistoriaAtual.endereco} foi concluída. Estou enviando o relatório em seguida.`;
    
    // Tentar Web Share API (se disponível)
    if (navigator.share && STATE.vistoriaAtual.pdfBlob) {
        try {
            const file = new File(
                [STATE.vistoriaAtual.pdfBlob],
                `Vistoria_${STATE.vistoriaAtual.endereco.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                { type: 'application/pdf' }
            );
            
            await navigator.share({
                title: 'Relatório de Vistoria',
                text: mensagem,
                files: [file]
            });
            
            return;
        } catch (err) {
            console.log('Web Share não suportado, usando link direto');
        }
    }
    
    // Fallback: abrir WhatsApp com mensagem
    const numeroLimpo = telefone.replace(/\D/g, '');
    const whatsappLink = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappLink, '_blank');
    
    alert('📱 WhatsApp aberto!\n\nEnvie o PDF manualmente.');
}

// ========================================
// LIMPAR FORMULÁRIO
// ========================================

function limparFormulario() {
    if (!confirm('⚠️ ATENÇÃO!\n\nTodos os dados serão apagados permanentemente.\n\nDeseja realmente limpar o formulário?')) {
        return;
    }
    
    // Limpar cronômetro
    if (STATE.intervaloCronometro) {
        clearInterval(STATE.intervaloCronometro);
    }
    
    location.reload();
}

// ========================================
// AUTO DE IMPEDIMENTO
// ========================================

async function gerarAutoImpedimento() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.text('AUTO DE CONSTATAÇÃO DE IMPEDIMENTO', 105, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    let y = 40;
    
    pdf.text(`Contratante: ${STATE.vistoriaAtual.contratante}`, 20, y);
    y += 10;
    pdf.text(`Endereço: ${STATE.vistoriaAtual.endereco}`, 20, y);
    y += 10;
    pdf.text(`Data/Hora: ${formatarDataBR(STATE.vistoriaAtual.impedimento.timestamp)}`, 20, y);
    y += 15;
    
    pdf.setFont(undefined, 'bold');
    pdf.text('MOTIVO DO IMPEDIMENTO:', 20, y);
    y += 7;
    pdf.setFont(undefined, 'normal');
    pdf.text(STATE.vistoriaAtual.impedimento.motivo, 20, y);
    y += 15;
    
    const valorBase = calcularValorBase();
    const valorCobrado = valorBase === 'Sob análise' ? 'Sob análise' : formatarMoeda(valorBase * 0.5);
    
    pdf.text(`Valor a ser cobrado (50% do valor base): ${valorCobrado}`, 20, y);
    
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Auto_Impedimento_${STATE.vistoriaAtual.endereco.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================================
// EVENT LISTENERS E INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar DB
    await inicializarDB();
    
    // Monitorar status
    atualizarStatusRede();
    await monitorarBateria();
    await verificarEspacoArmazenamento();
    
    // Carregar logo
    carregarLogo();
    
    // Iniciar GPS
    iniciarCheckin();
    
    // Event Listeners - Check-in
    document.getElementById('btn-checkin').addEventListener('click', realizarCheckin);
    document.getElementById('btn-impedimento').addEventListener('click', abrirModalImpedimento);
    document.getElementById('btn-cancelar-impedimento').addEventListener('click', fecharModalImpedimento);
    document.getElementById('btn-confirmar-impedimento').addEventListener('click', confirmarImpedimento);
    
    // Event Listeners - Formulário
    document.getElementById('tipo-imovel').addEventListener('change', atualizarTipoImovel);
    document.getElementById('contratante').addEventListener('input', debounce(salvarAutoSave, 500));
    document.getElementById('endereco').addEventListener('input', debounce(salvarAutoSave, 500));
    document.getElementById('tipologia').addEventListener('input', debounce(salvarAutoSave, 500));
    document.getElementById('modalidade').addEventListener('change', salvarAutoSave);
    document.getElementById('faixa-metragem').addEventListener('change', salvarAutoSave);
    
    // Event Listeners - Blocos
    document.getElementById('btn-adicionar-bloco').addEventListener('click', () => {
        adicionarBlocoVistoria();
    });
    
    // Event Listeners - Fotos
    document.getElementById('camera-input').addEventListener('change', (e) => {
        const blocoId = e.target.dataset.blocoId;
        processarFotos(Array.from(e.target.files), blocoId);
        e.target.value = ''; // Reset
    });
    
    document.getElementById('file-input').addEventListener('change', (e) => {
        const blocoId = e.target.dataset.blocoId;
        processarFotos(Array.from(e.target.files), blocoId);
        e.target.value = ''; // Reset
    });
    
    // Event Listeners - Assinaturas
    document.getElementById('btn-nova-assinatura').addEventListener('click', adicionarAssinatura);
    
    // Event Listeners - Ações
    document.getElementById('btn-gerar-pdf').addEventListener('click', gerarPDF);
    document.getElementById('btn-enviar-email').addEventListener('click', enviarEmail);
    document.getElementById('btn-enviar-whatsapp').addEventListener('click', enviarWhatsApp);
    document.getElementById('btn-limpar-formulario').addEventListener('click', limparFormulario);
    
    // Motivo impedimento "Outro"
    document.getElementById('motivo-impedimento').addEventListener('change', (e) => {
        const outroInput = document.getElementById('motivo-outro');
        outroInput.style.display = e.target.value === 'Outro' ? 'block' : 'none';
    });
    
    console.log('✅ App inicializado');
});

function atualizarTipoImovel() {
    const tipo = document.getElementById('tipo-imovel').value;
    STATE.vistoriaAtual.tipoImovel = tipo;
    
    if (!tipo) return;
    
    // Atualizar tipologias
    const tipologiaInput = document.getElementById('tipologia');
    const tipologiasList = document.getElementById('tipologias-list');
    tipologiaInput.placeholder = 'Selecione...';
    tipologiaInput.disabled = false;
    popularDatalist('tipologias-list', GLOSSARIOS.tipologias[tipo]);
    
    // Atualizar faixas de metragem
    const faixaSelect = document.getElementById('faixa-metragem');
    faixaSelect.innerHTML = '<option value="">Selecione...</option>' +
        FAIXAS_METRAGEM[tipo].map(f => `<option value="${f}">${f}</option>`).join('');
    
    // Ocultar "Entrega de chaves" para Terreno
    if (tipo === 'Terreno') {
        document.querySelector('[value="Vistoria de entrega de chaves"]').style.display = 'none';
    } else {
        document.querySelector('[value="Vistoria de entrega de chaves"]').style.display = 'block';
    }
    
    // Atualizar label ambiente
    const labelAmbiente = tipo === 'Residencial' ? 'CÔMODOS' :
                         tipo === 'Comercial' ? 'ESPAÇOS' : 'SETORES';
    document.getElementById('tipo-ambiente').textContent = labelAmbiente;
    
    // Limpar blocos existentes
    document.getElementById('blocos-vistoria').innerHTML = '';
    STATE.vistoriaAtual.blocos = [];
    STATE.totalFotos = 0;
    atualizarContadores();
    
    // Adicionar primeiro bloco
    adicionarBlocoVistoria();
    
    salvarAutoSave();
}

function carregarLogo() {
    // Carregar logo do upload
    fetch('/mnt/user-data/uploads/Logotipo_02b.png')
        .then(res => res.blob())
        .then(blob => imagemParaBase64(blob))
        .then(base64 => {
            document.getElementById('logo-header').src = base64;
        })
        .catch(err => console.warn('Logo não carregado:', err));
}

console.log('🚀 Vistoria Imobiliária PWA v1.0 - Carregado');

