// --- Animações de Rolagem ---
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });
revealElements.forEach(el => revealObserver.observe(el));

// --- Lógica do Formulário ---
const form = document.getElementById('copaForm');
const scriptURL = 'URL_DO_SEU_APPS_SCRIPT_AQUI'; // <-- COLE SUA URL AQUI

// Mostra o nome do arquivo selecionado
form.addEventListener('change', function(e) {
    if (e.target.matches('.file-input')) {
        const previewContainer = e.target.nextElementSibling;
        if (previewContainer) {
            previewContainer.textContent = e.target.files.length > 0 ? e.target.files[0].name : '';
        }
    }
});

// Função para converter arquivo para base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    const successMessage = form.querySelector('.success-message');
    
    // Validação simples
    const coopNome = document.getElementById('coopNome');
    const paNome = document.getElementById('paNome');
    let isValid = true;

    if (!coopNome.value.trim()) {
        coopNome.classList.add('invalid');
        isValid = false;
    } else {
        coopNome.classList.remove('invalid');
    }

    if (!paNome.value.trim()) {
        paNome.classList.add('invalid');
        isValid = false;
    } else {
        paNome.classList.remove('invalid');
    }
    
    if (!isValid) {
        alert('Por favor, preencha os campos de identificação obrigatórios.');
        return;
    }

    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;

    const formData = new FormData(form);
    const data = {};
    
    // Pega os dados de texto
    for (let [key, value] of formData.entries()) {
        if (typeof value === 'string') {
            data[key] = value;
        }
    }
    
    // Processa os arquivos
    const fileInputs = form.querySelectorAll('.file-input');
    for (const input of fileInputs) {
        if (input.files[0]) {
            const file = input.files[0];
            data[input.name] = {
                fileName: file.name,
                mimeType: file.type,
                base64: await fileToBase64(file)
            };
        }
    }
    
    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.status === 'success') {
            successMessage.textContent = 'Evidências enviadas com sucesso! Obrigado.';
            successMessage.style.display = 'block';
            form.reset();
            document.querySelectorAll('.file-preview').forEach(el => el.textContent = '');
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        console.error('Erro!', error.message);
        alert('Ocorreu um erro ao enviar o formulário. Tente novamente.');
    } finally {
        submitButton.textContent = 'Enviar Evidências';
        submitButton.disabled = false;
    }
});
