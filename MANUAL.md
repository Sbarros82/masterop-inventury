# Manual de Uso do Masterop Patrimonial
## Sistema Avançado de Controle Patrimonial e Inventário Físico

Este manual serve como guia de instruções detalhadas para operadores e administradores utilizarem com eficiência todos os módulos do **Masterop Patrimonial**, garantindo conformidade, exatidão patrimonial e total controle no ciclo de vida dos bens da empresa.

---

## 📌 Índice
1. [Conexão e Controle de Banco de Dados](#1-conexão-e-controle-de-banco-de-dados)
2. [Gestão de Estrutura (Unidades e Responsáveis)](#2-gestão-de-estrutura-unidades-e-responsáveis)
3. [Cadastro de Ativos Fixos](#3-cadastro-de-ativos-fixos)
4. [Transferências de Custódia e Localização](#4-transferências-de-custódia-e-localização)
5. [Ordens de Manutenção (OS)](#5-ordens-de-manutenção-os)
6. [Inventário e Auditoria Física](#6-inventário-e-auditoria-física)
7. [Boas Práticas e Segurança](#7-boas-práticas-e-segurança)

---

## 1. Conexão e Controle de Banco de Dados

O Masterop Patrimonial possui um motor de persistência híbrido altamente seguro, permitindo operações estáveis até mesmo em situações de declínio de conectividade de rede.

### 🌐 Alternância Híbrida (Local vs. Cloud)
Na barra superior do sistema, há um indicador visual dinâmico do estado atual do banco de dados:
* **Banco Cloud Firestore (Sincronizado)**: Indica que cada inserção ou modificação está salvando em nuvem de maneira segura em tempo real, visível para todos os demais usuários.
* **Banco Local (Offline)**: Ativa um cache exclusivo contido no próprio navegador (`localStorage`), possibilitando operar sem internet. Quando ativo, as ações ficam guardadas localmente no seu computador.

### ⚠️ Função "Zerar Banco" (Modo Limpeza Total)
Para possibilitar o início de um novo ciclo empresarial, audição limpa ou testes, foi adicionado o recurso de limpeza integral do banco de dados:
1. Clique no botão vermelho **"Zerar Banco"** no canto superior direito.
2. O sistema identificará se você está em modo Offline (limpará apenas o navegador) ou Online (limpará as coleções comuns de toda a rede no Firestore).
3. **Double-confirm**: Você precisará confirmar duas vezes seguidas para evitar gatilhos acidentais. Após a dupla confirmação, todos os ativos, transferências, ordens de serviços e auditorias serão apagados de maneira irreversível, configurando um estado 100% em branco para novos cadastros.

---

## 2. Gestão de Estrutura (Unidades e Responsáveis)

Antes de cadastrar bens diretamente, configure a sua malha logística e os agentes responsáveis no módulo **Unidades / Pessoas**:

* **Unidades (Localizações)**: Representam prédios, laboratórios, salas administrativas, departamentos ou filiais de estocagem. Clique em **"Nova Unidade"** para associar nomes, códigos de endereçamento e descritivos específicos.
* **Responsáveis (Detentores ou Custodiantes)**: Agentes civis ou técnicos fiscais responsáveis diretos pela integridade do ativo enquanto ele estiver alocado em sua área de atuação. Cadastre-os fornecendo nome completo, cargo e e-mail corporativo.

---

## 3. Cadastro de Ativos Fixos

O módulo **Ativos Fixos** abriga a listagem, filtros qualitativos e ficha técnica e cadastral de cada pertence:

* **Adicionar Ativo**: Clique em **"Novo Ativo"** para inserir:
  * *Número de Patrimônio (Tag/Plaqueta)*: Id de identificação exclusiva.
  * *Nome/Modelo do Bem*: Ex. "Ar-Condicionado Split 12.000 BTUs" ou "Impressora Multifuncional HP".
  * *Categoria*: Móveis & Utensílios, TI & Eletrônicos, Maquinários, Veículos ou Outros.
  * *Valor**: Para avaliação econômica e cálculo de amortização direta.
  * *Local de Origem e Responsável de Custódia*: Onde inicia em funcionamento.
* **Busca e Filtragem**: Você pode filtrar instantaneamente por tags, categorias ou estados operacionais (Ativo, Em Manutenção, Transferido, Baixado).

---

## 4. Transferências de Custódia e Localização

Bens não são estáticos. Toda mudança física de sala, setor ou alteração de responsável precisa ser escriturada formalmente:

1. Acesse o menu **Transferências**.
2. Clique em **"Registrar Movimentação"** ou inicie a transferência diretamente de dentro da ficha do Ativo.
3. Defina qual Ativo será movido, para qual nova Unidade ele se deslocará e sob qual Responsável ele passará a responder.
4. Escreva uma Justificativa Formal (Ex: *"Remanejamento de TI devido ao fim do home-office"*).
5. O histórico do ativo guardará essa trilha perene de movimentação para vistorias fiscais futuros.

---

## 5. Ordens de Manutenção (OS)

Equipamentos estão sujeitos a desgaste operacional. O módulo **Manutenção / OS** garante que você gerencie preventivas e corretivas:

1. Abra uma ocorrência selecionando o bem defeituoso, a gravidade (Baixa, Média, Crítica) e o descritivo técnico do problema.
2. O sistema altera o status visual do ativo nos painéis gerais automaticamente para **Em Manutenção**.
3. **Resolução**: Quando o técnico finalizar os reparos, feche a OS registrando o custo final do reparo e observações conclusivas, ou cancele a ordem caso seja decretada a perda/baixa definitiva do ativo.

---

## 6. Inventário e Auditoria Física

Confrontar o "patrimônio contábil" com a "vida real" das plantas físicas é essencial para conformidades (ex. Auditorias e regras SOX):

1. **Iniciar Inventário**: Vá em **Inventário Físico** e clique em **"Iniciar Auditoria"**, nomeando o lote atual (Ex: *"Auditoria Geral de Equipamentos SP - Q3"*).
2. **Confrontação**: Conforme o fiscal caminhar pelas salas, ele seleciona os bens na listagem local de vistoria, marca observações e bipa/seleciona confirmando a presença física deles.
3. **Status de Validação**: O sistema acusa quais bens permanecem pendentes (não localizados ainda) e quais foram localizados com sucesso.
4. **Concluir**: Finalize a auditoria para travar o lote e gerar relatórios de conformidade ou possíveis distorções patrimoniais.

---

## 7. Boas Práticas e Segurança

* **Consultas Rápidas**: Utilize o buscador global instantâneo para achar itens pelo número gravado na plaqueta física.
* **Zelo de Sessão**: Caso decida alternar o modo em nuvem, esteja ciente de que os dados do modo local ficam salvos no armazenamento interno do seu navegador específico e não aparecem nos computadores de outros colegas. Para compartilhamento corporativo, opere sempre em **Banco Cloud Firestore (Sincronizado)**.
* **Sincronia de Segurança**: O botão circular de re-sincronia serve para buscar alterações fresquinhas efetuadas por terceiros em outras dependências.
