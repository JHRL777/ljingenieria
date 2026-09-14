const client = window.supabaseClient;
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginMessage = document.getElementById('login-message');
const projectMessage = document.getElementById('project-message');
const projectsList = document.getElementById('projects-list');

function message(element, text, type = '') { element.textContent = text; element.className = `form-message ${type}`; }
function showDashboard(signedIn) { loginView.hidden = signedIn; dashboardView.hidden = !signedIn; if (signedIn) loadProjects(); }

async function loadProjects() {
  projectsList.textContent = 'Cargando proyectos…';
  const { data, error } = await client.from('projects').select('id,title,description,created_at,project_images(storage_path)').order('created_at', { ascending: false });
  if (error) { projectsList.textContent = 'No fue posible cargar los proyectos.'; return; }
  projectsList.replaceChildren();
  if (!data.length) { projectsList.innerHTML = '<p class="empty">Aún no has publicado proyectos desde este panel.</p>'; return; }
  data.forEach((project) => {
    const row = document.createElement('article'); row.className = 'project-row';
    const details = document.createElement('div'); const title = document.createElement('strong'); title.textContent = project.title;
    const info = document.createElement('p'); info.textContent = `${project.project_images.length} foto(s) · ${project.description}`;
    details.append(title, info);
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Eliminar';
    remove.addEventListener('click', () => deleteProject(project)); row.append(details, remove); projectsList.append(row);
  });
}

async function deleteProject(project) {
  if (!confirm(`¿Eliminar “${project.title}”? Esta acción no se puede deshacer.`)) return;
  const paths = project.project_images.map((image) => image.storage_path).filter(Boolean);
  if (paths.length) await client.storage.from('project-images').remove(paths);
  const { error } = await client.from('projects').delete().eq('id', project.id);
  if (error) { alert(`No se pudo eliminar: ${error.message}`); return; }
  loadProjects();
}

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault(); message(loginMessage, 'Ingresando…');
  const { error } = await client.auth.signInWithPassword({ email: document.getElementById('email').value, password: document.getElementById('password').value });
  if (error) { message(loginMessage, error.message, 'error'); return; }
  showDashboard(true);
});

document.getElementById('logout-button').addEventListener('click', async () => { await client.auth.signOut(); showDashboard(false); });

document.getElementById('project-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget; const submit = form.querySelector('button[type="submit"]');
  const files = [...document.getElementById('images').files];
  if (!files.length) return;
  if (files.some((file) => file.size > 8 * 1024 * 1024)) { message(projectMessage, 'Cada foto debe pesar máximo 8 MB.', 'error'); return; }
  submit.disabled = true; message(projectMessage, 'Subiendo fotos y publicando proyecto…');
  const projectId = crypto.randomUUID(); const storagePaths = [];
  try {
    for (const [index, file] of files.entries()) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
      const path = `${projectId}/${Date.now()}-${index}-${safeName}`;
      const { error } = await client.storage.from('project-images').upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error; storagePaths.push(path);
    }
    const { error: projectError } = await client.from('projects').insert({ id: projectId, title: document.getElementById('title').value.trim(), description: document.getElementById('description').value.trim(), category: document.getElementById('category').value.trim(), published: true });
    if (projectError) throw projectError;
    const { error: imageError } = await client.from('project_images').insert(storagePaths.map((storage_path, position) => ({ project_id: projectId, storage_path, alt_text: document.getElementById('title').value.trim(), position })));
    if (imageError) throw imageError;
    form.reset(); message(projectMessage, 'Proyecto publicado correctamente.', 'success'); loadProjects();
  } catch (error) {
    if (storagePaths.length) await client.storage.from('project-images').remove(storagePaths);
    message(projectMessage, `No fue posible publicar: ${error.message}`, 'error');
  } finally { submit.disabled = false; }
});

client.auth.getSession().then(({ data }) => showDashboard(Boolean(data.session)));
