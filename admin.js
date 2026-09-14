const client = window.supabaseClient;
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginMessage = document.getElementById('login-message');
const projectMessage = document.getElementById('project-message');
const projectsList = document.getElementById('projects-list');
const projectForm = document.getElementById('project-form');
const editingProjectId = document.getElementById('editing-project-id');
const projectSubmit = document.getElementById('project-submit');
const cancelEdit = document.getElementById('cancel-edit');
const imagesInput = document.getElementById('images');
const uploadPreview = document.getElementById('upload-preview');
let previewUrls = [];

function message(element, text, type = '') { element.textContent = text; element.className = `form-message ${type}`; }
function showDashboard(signedIn) { loginView.hidden = signedIn; dashboardView.hidden = !signedIn; if (signedIn) loadProjects(); }

async function loadProjects() {
  projectsList.textContent = 'Cargando proyectos…';
  const { data, error } = await client.from('projects').select('id,title,description,category,created_at,project_images(storage_path,position)').order('created_at', { ascending: false });
  if (error) { projectsList.textContent = 'No fue posible cargar los proyectos.'; return; }
  projectsList.replaceChildren();
  if (!data.length) { projectsList.innerHTML = '<p class="empty">Aún no has publicado proyectos desde este panel.</p>'; return; }
  data.forEach((project) => {
    const row = document.createElement('article'); row.className = 'project-row';
    const details = document.createElement('div'); const title = document.createElement('strong'); title.textContent = project.title;
    const info = document.createElement('p'); info.textContent = `${project.project_images.length} foto(s) · ${project.description}`;
    details.append(title, info);
    const actions = document.createElement('div');
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Editar'; edit.className = 'button-secondary';
    edit.addEventListener('click', () => startEditing(project));
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Eliminar';
    remove.addEventListener('click', () => deleteProject(project));
    actions.append(edit, remove); row.append(details, actions); projectsList.append(row);
  });
}

function startEditing(project) {
  editingProjectId.value = project.id;
  document.getElementById('title').value = project.title;
  document.getElementById('description').value = project.description;
  document.getElementById('category').value = project.category || '';
  document.getElementById('project-form-title').textContent = 'Editar proyecto';
  document.getElementById('images-help').textContent = 'Opcional: selecciona hasta 6 fotos nuevas para agregarlas al proyecto. Máximo 8 MB cada una.';
  projectSubmit.textContent = 'Guardar cambios';
  cancelEdit.hidden = false;
  message(projectMessage, 'Editando proyecto. Las fotos nuevas se agregarán a las existentes.');
  document.getElementById('title').focus();
  document.getElementById('project-form-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetProjectForm() {
  projectForm.reset();
  clearImagePreview();
  editingProjectId.value = '';
  document.getElementById('project-form-title').textContent = 'Agregar proyecto';
  document.getElementById('images-help').textContent = 'Selecciona hasta 6 fotos. Máximo 8 MB cada una.';
  projectSubmit.textContent = 'Publicar proyecto';
  cancelEdit.hidden = true;
}

function clearImagePreview() {
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
  previewUrls = [];
  uploadPreview.replaceChildren();
}

function renderImagePreview() {
  clearImagePreview();
  [...imagesInput.files].forEach((file, index) => {
    const item = document.createElement('li');
    const thumbnail = document.createElement('img');
    const url = URL.createObjectURL(file);
    previewUrls.push(url);
    thumbnail.src = url;
    thumbnail.alt = '';
    const name = document.createElement('span');
    name.textContent = `${index + 1}. ${file.name} (${Math.ceil(file.size / 1024)} KB)`;
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = 'Quitar';
    remove.addEventListener('click', () => {
      const files = [...imagesInput.files];
      const replacement = new DataTransfer();
      files.filter((_, fileIndex) => fileIndex !== index).forEach((selectedFile) => replacement.items.add(selectedFile));
      imagesInput.files = replacement.files;
      renderImagePreview();
    });
    item.append(thumbnail, name, remove); uploadPreview.append(item);
  });
}

imagesInput.addEventListener('change', () => {
  if (imagesInput.files.length > 6) {
    imagesInput.value = '';
    clearImagePreview();
    message(projectMessage, 'Puedes seleccionar un máximo de 6 fotos por carga.', 'error');
    return;
  }
  renderImagePreview();
  if (imagesInput.files.length) message(projectMessage, `${imagesInput.files.length} foto(s) seleccionada(s).`);
});

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

cancelEdit.addEventListener('click', () => { resetProjectForm(); message(projectMessage, 'Edición cancelada.'); });

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget; const submit = form.querySelector('button[type="submit"]');
  const files = [...imagesInput.files];
  const isEditing = Boolean(editingProjectId.value);
  if (!isEditing && !files.length) { message(projectMessage, 'Selecciona al menos una foto.', 'error'); return; }
  if (files.some((file) => file.size > 8 * 1024 * 1024)) { message(projectMessage, 'Cada foto debe pesar máximo 8 MB.', 'error'); return; }
  submit.disabled = true; message(projectMessage, 'Subiendo fotos y publicando proyecto…');
  const projectId = isEditing ? editingProjectId.value : crypto.randomUUID(); const storagePaths = [];
  try {
    for (const [index, file] of files.entries()) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
      const path = `${projectId}/${Date.now()}-${index}-${safeName}`;
      const { error } = await client.storage.from('project-images').upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error; storagePaths.push(path);
    }
    const projectData = { title: document.getElementById('title').value.trim(), description: document.getElementById('description').value.trim(), category: document.getElementById('category').value.trim(), published: true };
    const { error: projectError } = isEditing
      ? await client.from('projects').update(projectData).eq('id', projectId)
      : await client.from('projects').insert({ id: projectId, ...projectData });
    if (projectError) throw projectError;
    if (storagePaths.length) {
      const { data: savedImages, error: savedImagesError } = await client.from('project_images').select('position').eq('project_id', projectId).order('position', { ascending: false }).limit(1);
      if (savedImagesError) throw savedImagesError;
      const firstPosition = savedImages.length ? savedImages[0].position + 1 : 0;
      const { error: imageError } = await client.from('project_images').insert(storagePaths.map((storage_path, index) => ({ project_id: projectId, storage_path, alt_text: document.getElementById('title').value.trim(), position: firstPosition + index })));
      if (imageError) throw imageError;
    }
    resetProjectForm(); message(projectMessage, isEditing ? 'Cambios guardados correctamente.' : 'Proyecto publicado correctamente.', 'success'); loadProjects();
  } catch (error) {
    if (storagePaths.length) await client.storage.from('project-images').remove(storagePaths);
    message(projectMessage, `No fue posible publicar: ${error.message}`, 'error');
  } finally { submit.disabled = false; }
});

client.auth.getSession().then(({ data }) => showDashboard(Boolean(data.session)));
