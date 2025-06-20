document.addEventListener('DOMContentLoaded', () => {
    const numPeopleInput = document.getElementById('num-people');
    const tasksInput = document.getElementById('tasks');
    const distributeBtn = document.getElementById('distribute-btn');
    const resultsDiv = document.getElementById('results');
    const outputSection = document.getElementById('output-section');
    const whatsappShareBtn = document.getElementById('whatsapp-share-btn');
    const cooldownInfo = document.getElementById('cooldown-info');
    const cooldownTime = document.getElementById('cooldown-time');
    const successMessage = document.getElementById('success-message');
    const namesContainer = document.getElementById('names-container');

    /*const SHUFFLE_COOLDOWN = 24 * 60 * 60 * 1000; // 24 horas em milissegundos */
    const STORAGE_KEY = 'taskDistributor';

    // Atualizar campos de nomes baseado no número de pessoas
    function updateNameFields() {
        const numPeople = parseInt(numPeopleInput.value);
        namesContainer.innerHTML = '';
        
        for (let i = 1; i <= numPeople; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'person-name';
            input.placeholder = `Pessoa ${i}`;
            input.setAttribute('data-person', i);
            namesContainer.appendChild(input);
        }
        
        // Carregar nomes salvos se existirem
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (saved.names) {
            const nameInputs = document.querySelectorAll('.person-name');
            nameInputs.forEach((input, index) => {
                if (saved.names[index]) {
                    input.value = saved.names[index];
                }
            });
        }
    }

    // Carregar dados salvos
    function loadSavedData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            if (data.lastShuffleTime) {
                checkCooldown(data.lastShuffleTime);
            }
            if (data.tasks) {
                tasksInput.value = data.tasks;
            }
            if (data.numPeople) {
                numPeopleInput.value = data.numPeople;
                updateNameFields();
            }
        }
    }

    // Salvar dados
    function saveData(data) {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const updated = { ...existing, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    // Obter nomes das pessoas
    function getPersonNames() {
        const nameInputs = document.querySelectorAll('.person-name');
        const names = [];
        nameInputs.forEach((input, index) => {
            const name = input.value.trim();
            names.push(name || `Pessoa ${index + 1}`);
        });
        return names;
    }

    // Verificar cooldown
    function getLocalDateStr() {
        return new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
    } 

    function checkCooldown(lastShuffleDate) {
        const todayStr = getLocalDateStr();
        if (lastShuffleDate === todayStr) {
            // Ainda no mesmo dia
            showCooldownInfo();
            return false;
        }
        return true;
    } 

    /*function checkCooldown(lastShuffleTime) {
        const now = new Date().getTime();
        const timeDiff = now - lastShuffleTime;
        
        if (timeDiff < SHUFFLE_COOLDOWN) {
            const remainingTime = SHUFFLE_COOLDOWN - timeDiff;
            showCooldownInfo(remainingTime);
            return false;
        }
        return true;
    } */

    // Mostrar informação de cooldown

    function showCooldownInfo() {
        cooldownTime.textContent = 'Hoje já foi feita a distribuição.';
        cooldownInfo.style.display = 'block';
        distributeBtn.disabled = true;
        distributeBtn.textContent = '⏰ Aguarde até amanhã';
    }

    /* function showCooldownInfo(remainingTime) {
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        
        cooldownTime.textContent = `${hours}h ${minutes}m`;
        cooldownInfo.style.display = 'block';
        distributeBtn.disabled = true;
        distributeBtn.textContent = '⏰ Aguarde o Tempo de Espera'; 
    }*/
        
        // Atualizar a cada minuto
    /*    const interval = setInterval(() => {
            const now = new Date().getTime();
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (!saved.lastShuffleTime || now - saved.lastShuffleTime >= SHUFFLE_COOLDOWN) {
                clearInterval(interval);
                cooldownInfo.style.display = 'none';
                distributeBtn.disabled = false;
                distributeBtn.textContent = '🎲 Distribuir Tarefas';
            } else {
                const newRemainingTime = SHUFFLE_COOLDOWN - (now - saved.lastShuffleTime);
                const newHours = Math.floor(newRemainingTime / (1 * 1 * 1));
                const newMinutes = Math.floor((newRemainingTime % (1 * 1 * 1)) / (1 * 1));
                cooldownTime.textContent = `${newHours}h ${newMinutes}m`;
            }
        }, 60000); */
    

    // Validar entrada
    function validateInput() {
        const numPeople = parseInt(numPeopleInput.value);
        let tasks = tasksInput.value.split(',').map(task => task.trim()).filter(task => task !== '');

        if (numPeople < 2 || numPeople > 5) {
            alert('❌ O número de pessoas deve ser entre 2 e 5.');
            return false;
        }

        if (tasks.length === 0) {
            alert('❌ Por favor, insira pelo menos uma tarefa.');
            return false;
        }

        if (tasks.length < numPeople) {
            alert(`❌ Deve haver pelo menos ${numPeople} tarefas para ${numPeople} pessoas.`);
            return false;
        }

        if (tasks.length % numPeople !== 0) {
            alert(`❌ Divisão injusta! ${tasks.length} tarefas não podem ser dividido igualmente entre ${numPeople} pessoas.`);
            return false;
        }

        return { numPeople, tasks };
    }

   /* function validateInput() {
        const numPeople = parseInt(numPeopleInput.value);
        let tasks = tasksInput.value.split(',').map(task => task.trim()).filter(task => task !== '');

        if (numPeople < 2 || numPeople > 5) {
            alert('❌ O número de pessoas deve ser entre 2 e 5.');
            return false;
        }

        if (tasks.length === 0) {
            alert('❌ Por favor, insira pelo menos uma tarefa.');
            return false;
        }

        // Nova regra: para distribuição igualitária, o número de tarefas deve ser divisível pelo número de pessoas
        // ou ter um resto que permita distribuição justa
        if (tasks.length < numPeople) {
            alert(`❌ Deve haver pelo menos ${numPeople} tarefas para ${numPeople} pessoas.`);
            return false;
        }

        return { numPeople, tasks };
    } */

    // Embaralhar array
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Distribuir tarefas de forma igualitária
    function distributeTasks(numPeople, tasks, names) {
        const shuffledTasks = shuffleArray(tasks);
        const tasksPerPerson = Math.floor(shuffledTasks.length / numPeople);
        const remainder = shuffledTasks.length % numPeople;

        const distribution = [];
        let taskIndex = 0;

        for (let i = 0; i < numPeople; i++) {
            // Pessoas com índices menores recebem uma tarefa extra se houver resto
            const extraTask = i < remainder ? 1 : 0;
            const personTasks = shuffledTasks.slice(taskIndex, taskIndex + tasksPerPerson + extraTask);
            taskIndex += tasksPerPerson + extraTask;

            distribution.push({
                name: names[i],
                tasks: personTasks
            });
        }

        return distribution;
    }

    // Mostrar resultados com tarefas enumeradas
    function displayResults(distribution) {
        resultsDiv.innerHTML = '';
        
        distribution.forEach((person, index) => {
            const personDiv = document.createElement('div');
            personDiv.className = 'person-result';
            
            let tasksHtml = '';
            person.tasks.forEach((task, taskIndex) => {
                tasksHtml += `
                    <div class="task-item">
                        <span class="task-number">${taskIndex + 1}.</span>
                        ${task}
                    </div>
                `;
            });
            
            personDiv.innerHTML = `
                <div class="person-name-display">
                    <div class="person-icon">${index + 1}</div>
                    ${person.name}
                </div>
                <div class="person-tasks">
                    ${tasksHtml}
                </div>
            `;
            
            resultsDiv.appendChild(personDiv);
        });

        outputSection.style.display = 'block';
        whatsappShareBtn.style.display = 'block';
        
        // Mostrar mensagem de sucesso
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 4000);
    }

    // Gerar mensagem para WhatsApp
    function generateWhatsAppMessage(distribution) {
        let message = '🎯 *Distribuição de Tarefas* 🎯\n\n';
        message += '📋 Tarefas distribuídas de forma justa:\n\n';
        
        distribution.forEach(person => {
            message += `👤 *${person.name}:*\n`;
            person.tasks.forEach((task, index) => {
                message += `   ${index + 1}. ${task}\n`;
            });
            message += '\n';
        });
        
        message += '💪 Vamos trabalhar em equipe! 🚀';
        return message;
    }

    // Event listeners
    numPeopleInput.addEventListener('change', () => {
        updateNameFields();
        saveData({ numPeople: parseInt(numPeopleInput.value) });
    });

    distributeBtn.addEventListener('click', () => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (saved.lastShuffleDate && !checkCooldown(saved.lastShuffleDate)) {
            return;
        }

        const validation = validateInput();
        if (!validation) return;

        const { numPeople, tasks } = validation;
        const names = getPersonNames();

        const distribution = distributeTasks(numPeople, tasks, names);
        displayResults(distribution);

        const todayStr = getLocalDateStr();
        saveData({
            lastShuffleDate: todayStr,
            tasks: tasksInput.value,
            numPeople: numPeople,
            names: names,
            lastDistribution: distribution
        });

        const whatsappMessage = generateWhatsAppMessage(distribution);
        whatsappShareBtn.onclick = () => {
            const encodedMessage = encodeURIComponent(whatsappMessage);
            window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        };

        showCooldownInfo();
});

/*
    distributeBtn.addEventListener('click', () => {
        // Verificar cooldown
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (saved.lastShuffleTime && !checkCooldown(saved.lastShuffleTime)) {
            return;
        }

        // Validar entrada
        const validation = validateInput();
        if (!validation) return;

        const { numPeople, tasks } = validation;
        const names = getPersonNames();

        // Distribuir tarefas
        const distribution = distributeTasks(numPeople, tasks, names);
        displayResults(distribution);

        // Salvar dados
        const now = new Date().getTime();
        saveData({
            lastShuffleTime: now,
            tasks: tasksInput.value,
            numPeople: numPeople,
            names: names,
            lastDistribution: distribution
        });

        // Configurar botão do WhatsApp
        const whatsappMessage = generateWhatsAppMessage(distribution);
        whatsappShareBtn.onclick = () => {
            const encodedMessage = encodeURIComponent(whatsappMessage);
            window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        };

        // Mostrar cooldown
        showCooldownInfo(SHUFFLE_COOLDOWN);
    }); */

    // Salvar dados quando o utilizador digita
    tasksInput.addEventListener('input', () => {
        saveData({ tasks: tasksInput.value });
    });

    // Salvar nomes quando o utilizador digita
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('person-name')) {
            const names = getPersonNames();
            saveData({ names: names });
        }
    });

    // Inicializar
    updateNameFields();
    loadSavedData();

    // Adicionar algumas tarefas de exemplo se estiver vazio
    if (!tasksInput.value.trim()) {
        tasksInput.value = 'Lavar a loiça, Aspirar a casa, Fazer compras, Cozinhar jantar, Limpar casa de banho, Organizar quarto';
        saveData({ tasks: tasksInput.value });
    }
});  

