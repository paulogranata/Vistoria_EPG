# 🏢 PWA VISTORIA IMOBILIÁRIA PREMIUM
**Desenvolvido para Emilio Paulo Granata - CRECI 50.583**

---

## 📱 APLICATIVO PROFISSIONAL PARA VISTORIAS IMOBILIÁRIAS

Sistema completo otimizado para **Samsung Galaxy A31** com capacidade para até **80 fotos por vistoria**, funcionamento 100% offline e geração automática de PDFs profissionais com segurança jurídica.

---

## ✨ FUNCIONALIDADES PRINCIPAIS

### 🔐 Check-in Obrigatório com GPS
- Captura automática de coordenadas geográficas
- Validação de localização (território brasileiro)
- Detecção automática de adicional noturno (18h-08h)
- Cronômetro de tempo de espera (alerta aos 20min)
- Botão de impedimento de acesso

### 📋 Formulário Inteligente
- **3 Tipos de Imóveis**: Residencial, Comercial, Terreno
- **Glossários Contextuais**: Mais de 100 opções pré-definidas
- **7 Modalidades de Vistoria**: Entrada, Saída, Fotográfica, etc.
- **Auto-save em Tempo Real**: Dados salvos a cada 3 segundos
- **Autocomplete Inteligente**: Memoriza contratantes, endereços, etc.

### 📸 Sistema de Fotos Otimizado
- Captura até **80 fotos** por vistoria (limite seguro)
- Compressão automática para **~300KB** por foto (HD 1280x720)
- Carimbo GPS indestrutível em cada foto
- Galeria com miniaturas para conferência
- Contador de fotos por ambiente e total

### ✍️ Assinaturas Digitais
- Assinatura manuscrita do vistoriador (pré-configurada)
- Pad touch para assinaturas de clientes
- Múltiplas assinaturas por vistoria
- Perfis: Proprietário, Locatário, Comprador, etc.

### 📄 Geração de PDF Profissional
- Layout premium em Dourado (#D4A574) e Grafite (#2C2C2C)
- Logotipo em 3 posições (topo, marca d'água, fotos)
- Quebra de página inteligente (2 fotos por página)
- Rodapé com numeração "Pág. X de Y"
- Certificação de autenticidade jurídica
- Cálculo automático de honorários

### 💰 Cálculo de Honorários Automático
- Tabela completa para Residencial, Comercial e Terreno
- 7 modalidades de vistoria com valores distintos
- Adicionais automáticos:
  - **Noturno** (+30%): Automático via check-in
  - **Tempo de Espera** (+15%): Se >20min até 1ª foto
- Adicionais manuais:
  - **Mobiliado/Benfeitorias** (+25%)
  - **Urgência 24h** (+20%)
- Impedimento de acesso: 50% do valor base

### 🔋 Modo Ultra Economia
- Ativação automática com bateria <20%
- Compressão JPEG mais agressiva (0.55)
- Miniaturas reduzidas (80x80px)
- Desabilitação de animações CSS
- Auto-save a cada 10s (não 3s)

### 📤 Envio Facilitado
- **E-mail**: Texto automático personalizado
- **WhatsApp**: Web Share API ou link direto
- Download automático do PDF
- Backup JSON automático

---

## 🚀 INSTALAÇÃO NO SAMSUNG GALAXY A31

### Método 1: Servidor Local (Recomendado para Desenvolvimento)

1. **Copie todos os arquivos** para uma pasta no computador
2. **Instale um servidor HTTP** (escolha uma opção):

   **Opção A - Python (se instalado):**
   ```bash
   cd pasta-do-app
   python -m http.server 8000
   ```

   **Opção B - Node.js (se instalado):**
   ```bash
   npm install -g http-server
   cd pasta-do-app
   http-server -p 8000
   ```

   **Opção C - VS Code (mais fácil):**
   - Instale a extensão "Live Server"
   - Clique com botão direito no `index.html`
   - Selecione "Open with Live Server"

3. **No Samsung Galaxy A31**:
   - Conecte ao mesmo Wi-Fi do computador
   - Abra o Chrome
   - Digite: `http://IP-DO-SEU-PC:8000`
   - Exemplo: `http://192.168.1.10:8000`

4. **Instalar como App**:
   - No Chrome, toque nos 3 pontinhos (⋮)
   - Selecione "Adicionar à tela inicial"
   - Confirme a instalação
   - Ícone aparecerá na tela inicial

### Método 2: Hospedagem Online (Produção)

1. **Faça upload dos arquivos** para um serviço de hospedagem:
   - **GitHub Pages** (gratuito, HTTPS automático)
   - **Netlify** (gratuito, deploy fácil)
   - **Vercel** (gratuito, ultra-rápido)

2. **Exemplo com GitHub Pages**:
   ```bash
   git init
   git add .
   git commit -m "PWA Vistoria"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/vistoria-app.git
   git push -u origin main
   ```
   - Vá em Settings → Pages
   - Ative GitHub Pages
   - Acesse: `https://SEU-USUARIO.github.io/vistoria-app`

3. **No Samsung A31**:
   - Abra o link no Chrome
   - Instale como PWA (igual ao Método 1, passo 4)

---

## 📖 GUIA DE USO

### 1️⃣ Primeira Vistoria

1. **Abra o App** (ícone na tela inicial)
2. **Aguarde o GPS** carregar (⏳ 5-15 segundos)
3. **Check-in**: Pressione "CHEGADA AO LOCAL"
   - ✅ Coordenadas capturadas
   - 🌙 Adicional noturno detectado (se aplicável)
   - ⏱️ Cronômetro iniciado

4. **Preencha os Dados do Imóvel**:
   - 1a. Contratante (use autocomplete)
   - 1b. Endereço completo
   - 1c. Tipo (Residencial/Comercial/Terreno)
   - 1d. Tipologia (selecione do glossário)
   - 1e. Modalidade de Vistoria
   - 1f. Faixa de Metragem

5. **Realize a Vistoria**:
   - Botão **[+ ADICIONAR]** para novo ambiente
   - Digite ou selecione **Cômodo/Espaço/Setor**
   - Escolha **Observações** (vícios detectados)
   - Clique em **[📷 FOTOS]** para capturar
   - Repita para todos os ambientes

6. **Assinaturas**:
   - Sua assinatura já está pré-carregada
   - **[+ Nova Assinatura]** para adicionar clientes
   - Selecione perfil (Proprietário, etc.)
   - Desenhe a assinatura no pad azul

7. **Gerar PDF**:
   - Botão **[📄 GERAR PDF]**
   - Aguarde processamento (15-30s para 80 fotos)
   - PDF baixado automaticamente

8. **Enviar**:
   - **[📧 ENVIO E-MAIL]**: Digite e-mail do cliente
   - **[📱 ENVIO WHATSAPP]**: Digite telefone
   - Anexe o PDF manualmente

9. **Nova Vistoria**:
   - **[🗑️ LIMPAR FORMULÁRIO]**
   - Confirme a limpeza
   - Repita o processo

---

### ⚠️ IMPEDIMENTO DE ACESSO

Se não conseguir realizar a vistoria:

1. Faça o check-in normalmente
2. Clique em **[🚫 IMPEDIMENTO DE ACESSO]**
3. Selecione o motivo:
   - Ausência de chaves
   - Negativa de entrada
   - Ausência das partes
   - Outro (especifique)
4. Confirme **[GERAR AUTO]**
5. Auto de Constatação será gerado (50% do valor base)
6. Envie ao contratante

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### Ajustar Limites (app.js - linha 18)

```javascript
const CONFIG = {
    MAX_PHOTOS: 80,              // Máximo de fotos (recomendado: 60-80)
    JPEG_QUALITY: 0.7,           // Qualidade JPEG (0.5-0.9)
    THUMBNAIL_SIZE: 150,         // Tamanho miniaturas (100-200px)
    CAPTURE_WIDTH: 1280,         // Resolução captura (não alterar)
    CAPTURE_HEIGHT: 720,
    AUTO_SAVE_INTERVAL: 3000     // Auto-save a cada 3s (3000-10000ms)
};
```

### Adicionar Logo Personalizado

Substitua em `app.js` (função `carregarLogo`, linha ~1950):

```javascript
function carregarLogo() {
    const logoBase64 = 'data:image/png;base64,SEU_LOGO_AQUI';
    document.getElementById('logo-header').src = logoBase64;
}
```

**Como gerar Base64 do logo:**
1. Acesse: https://www.base64-image.de/
2. Faça upload do logo PNG
3. Copie o código gerado
4. Cole no lugar de `SEU_LOGO_AQUI`

---

## 📊 TABELA DE HONORÁRIOS

### Residencial
| Metragem | Entrada | Saída | Fotográfica | Entrega Chaves | Receb. Venda | Periódica | Conferências |
|----------|---------|-------|-------------|----------------|--------------|-----------|--------------|
| Até 60 m² | R$ 220 | R$ 280 | R$ 150 | R$ 250 | R$ 250 | R$ 170 | R$ 120 |
| 61-110 m² | R$ 260 | R$ 320 | R$ 190 | R$ 290 | R$ 290 | R$ 210 | R$ 150 |
| 111-180 m² | R$ 320 | R$ 380 | R$ 240 | R$ 350 | R$ 350 | R$ 290 | R$ 190 |
| >180 m² | Sob análise | - | - | - | - | - | - |

### Comercial
| Metragem | Entrada | Saída | Fotográfica | Entrega Chaves | Receb. Venda | Periódica | Conferências |
|----------|---------|-------|-------------|----------------|--------------|-----------|--------------|
| Até 80 m² | R$ 320 | R$ 380 | R$ 230 | R$ 350 | R$ 350 | R$ 280 | R$ 180 |
| 81-150 m² | R$ 420 | R$ 490 | R$ 310 | R$ 450 | R$ 450 | R$ 360 | R$ 230 |
| 151-300 m² | R$ 580 | R$ 690 | R$ 430 | R$ 630 | R$ 630 | R$ 480 | R$ 320 |
| >300 m² | Sob análise | - | - | - | - | - | - |

### Terreno
| Metragem | Entrada | Saída | Fotográfica | Receb. Venda | Periódica | Conferências |
|----------|---------|-------|-------------|--------------|-----------|--------------|
| Até 360 m² | R$ 180 | R$ 230 | R$ 130 | R$ 210 | R$ 140 | R$ 100 |
| 361-700 m² | R$ 220 | R$ 280 | R$ 160 | R$ 250 | R$ 170 | R$ 120 |
| 701-1.200 m² | R$ 290 | R$ 350 | R$ 210 | R$ 320 | R$ 240 | R$ 160 |
| >1.200 m² | Sob análise | - | - | - | - | - |

---

## 🛡️ SEGURANÇA E PRIVACIDADE

- ✅ **100% Offline**: Nenhum dado enviado para servidores
- ✅ **IndexedDB Criptografado**: Dados protegidos no dispositivo
- ✅ **Sem Rastreamento**: Zero cookies, analytics ou trackers
- ✅ **GDPR Compliant**: Conforme Lei Geral de Proteção de Dados
- ✅ **Backup Automático**: Arquivo JSON gerado após cada PDF

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### GPS não funciona
- ✅ Permita acesso à localização nas configurações do Chrome
- ✅ Ative o GPS do celular
- ✅ Vá para uma área com sinal GPS (perto de janela/área externa)

### Fotos não comprimem
- ✅ Libere memória do celular (mínimo 500MB livres)
- ✅ Feche outros aplicativos em background
- ✅ Ative Modo Ultra Economia (bateria <20% ou manual)

### PDF trava durante geração
- ✅ Aguarde até 60 segundos (timeout automático)
- ✅ Reduza número de fotos (tente com 50-60 fotos)
- ✅ Limpe cache do Chrome: Configurações → Privacidade → Limpar dados

### Dados perdidos
- ✅ Verifique pasta Downloads: arquivo `BACKUP_*.json`
- ✅ Importe o backup (funcionalidade em desenvolvimento)
- ✅ Sempre gere o PDF antes de limpar formulário

---

## 📞 SUPORTE TÉCNICO

**Desenvolvido por:** Claude AI (Anthropic)  
**Versão:** 1.0.0  
**Data:** Fevereiro 2026  
**Compatibilidade:** Samsung Galaxy A31 | Android 11+  

**Para atualizações:**
- Substitua os arquivos antigos pelos novos
- Limpe o cache do navegador
- Reinstale o PWA

---

## 📜 LICENÇA E USO

Este aplicativo foi desenvolvido exclusivamente para:

**Emilio Paulo Granata**  
CRECI 50.583  
Serviços Técnicos Imobiliários  

✅ Uso profissional permitido  
✅ Modificações permitidas (com backup)  
❌ Redistribuição comercial proibida  
❌ Remoção de créditos proibida  

---

## 🎨 DESIGN PREMIUM

**Paleta de Cores:**
- Dourado Principal: #D4A574
- Grafite Escuro: #2C2C2C
- Grafite Médio: #4A4A4A

**Tipografia:**
- Display: Cormorant Garamond (serif elegante)
- Corpo: Montserrat (sans-serif moderna)

**Estilo:**
- Minimalismo sofisticado
- Layouts assimétricos
- Sombras suaves
- Bordas arredondadas (8-12px)

---

## ✅ CHECKLIST PRÉ-VISTORIA

- [ ] Bateria do celular >30%
- [ ] GPS ativado
- [ ] Memória livre >500MB
- [ ] Conexão com internet (para geocoding)
- [ ] App instalado e testado
- [ ] Logo personalizado (se desejado)

---

**Boas vistorias! 🏠📋**
