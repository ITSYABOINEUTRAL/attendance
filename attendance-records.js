const tableBody = document.querySelector('#attendance-records tbody');

// Utility: format today’s date nicely
function formatToday() {
  const options = {  year: "numeric", month: "long", day: "numeric" };
  return new Date().toLocaleDateString("en-US", options);
}

// Fetch today's attendance
async function fetchAttendance() {
  try {
    const res = await fetch('https://attendance-backend-nt8h.onrender.com/api/attendance/today');
    if (!res.ok) throw new Error('Failed to fetch attendance');

    const data = await res.json();
    tableBody.innerHTML = '';

    data.forEach(member => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${formatToday()}</td>
        <td>${member.name}</td>
        <td>
          <input 
            type="checkbox" 
            ${member.status === 'Present' ? 'checked' : ''} 
            data-id="${member._id}"
          >
        </td>
      `;

      tableBody.appendChild(tr);
    });

    attachCheckboxListeners();
  } catch (error) {
    console.error('Error loading attendance:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="color:white; text-align:center;">
          ⚠️ Failed to load attendance
        </td>
      </tr>`;
  }
}

// Listen to checkbox changes
function attachCheckboxListeners() {
  const checkboxes = tableBody.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', async (e) => {
      const memberId = e.target.dataset.id;
      const status = e.target.checked ? 'Present' : 'Absent';

      try {
        const res = await fetch(`https://attendance-backend-v6kl.onrender.com/api/attendance/${memberId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });

        if (!res.ok) throw new Error('Failed to update attendance');
      } catch (err) {
        console.error(err);
        e.target.checked = !e.target.checked; // revert checkbox if update fails
        alert('Failed to update attendance, try again.');
      }
    });
  });
}

// Initial load
fetchAttendance();
