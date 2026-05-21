const SUPABASE_URL = 'ВАШ_URL';
const SUPABASE_ANON_KEY = 'ВАШ_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else initApp();
}

async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Проверьте почту!');
}

async function initApp() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        document.getElementById('user-welcome').innerText = `Привет, ${user.email}`;
    }
}

function showTab(tab) {
    document.getElementById('trainer-tab').classList.add('hidden');
    document.getElementById('client-tab').classList.add('hidden');
    document.getElementById(`${tab}-tab`).classList.remove('hidden');
    if (tab === 'trainer') loadTrainerWorkouts();
    else loadClientWorkouts();
}

async function loadTrainerWorkouts() {
    const { data } = await supabaseClient.from('workouts').select('*');
    const container = document.getElementById('trainer-workouts');
    container.innerHTML = data.map(w => `<div class="workout-item">${w.title} - ${w.price}₽</div>`).join('');
}

async function createWorkout() {
    const title = document.getElementById('workout-title').value;
    const price = document.getElementById('workout-price').value;
    const { data: { user } } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient.from('workouts').insert({
        title,
        price: parseFloat(price),
        trainer_id: user.id
    });

    if (error) alert(error.message);
    else loadTrainerWorkouts();
}

async function loadClientWorkouts() {
    const { data } = await supabaseClient.from('workouts').select('*');
    const container = document.getElementById('client-workouts');
    container.innerHTML = data.map(w => `
        <div class="workout-item">
            <strong>${w.title}</strong> (${w.price}₽)
            <button onclick="bookWorkout('${w.id}')">Записаться</button>
        </div>
    `).join('');
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    location.reload();
}

initApp();
