document.addEventListener('DOMContentLoaded', function() {
    // Configuração das animações
    const timeline = anime.timeline({
        loop: false,
        autoplay: true
    });

    // Animação principal
    timeline
        .add({
            targets: '#agradecimento-container',
            scale: [0, 1],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutElastic'
        })
        .add({
            targets: '.icon-thank-you',
            scale: [0, 1],
            rotateZ: [-30, 0],
            duration: 2000,
            offset: 0
        })
        .add({
            targets: '.text1',
            scale: [0, 1],
            rotateZ: [-10, 0],
            duration: 5000,
            offset: 200
        })
        .add({
            targets: '.text2',
            scale: [0, 1],
            rotateZ: [-10, 0],
            duration: 5000,
            offset: 200
        })

        .add({
            targets: '.text3',
            scale: [0, 1],
            rotateZ: [-10, 0],
            duration: 5000,
            offset: 200
        })
        
        .add({
            targets: '#alert-title-initial',
            opacity: [1, 0],
            scale: [1, 1.5],
            duration: 1000,
            delay: 1500,
            easing: 'linear'
        })
        .add({
            targets: '#alert-title-end',
            opacity: [0, 1],
            duration: 500,
            offset: '-=300'
        })
        .add({
            targets: '.alert-message',
            scale: [0, 1],
            duration: 600,
            offset: 200
        });

    // Redirecionamento automático após 20 segundos
    setTimeout(() => {
        window.location.href = 'T:\Publica\Técnico em Informática - TI 0523\Uc12 - Uc15 Arquivos alunos\Marcos Kim\Roleta\Prototipo04\index.html';
    }, 5000);
});