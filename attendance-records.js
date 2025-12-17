const tableBody = document.querySelector('#attendance-records tbody');

// Utility: format today’s date nicely
function formatToday() {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date().toLocaleDateString("en-US", options);
}

// Fetch members and today's attendance
async function fetchAttendance() {
  try {
    // Fetch all members (with gender)
    const resMembers = await fetch('https://attendance-backend-ub0l.onrender.com/api/attendance/all');
    if (!resMembers.ok) throw new Error('Failed to fetch members');

    const data = await resMembers.json();
    const dates = data.dates; // all past dates
    const members = data.members;

    tableBody.innerHTML = '';

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    members.forEach(member => {
      // Get today's attendance if exists
      const todayRecord = member.attendance[today] || { firstService: 'Absent', secondService: 'Absent' };

      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${formatToday()}</td>
        <td>${member.name}</td>
        <td>
          <input type="checkbox" data-id="${member._id}" data-gender="Male" ${member.gender === 'Male' ? 'checked' : ''}>
        </td>
        <td>
          <input type="checkbox" data-id="${member._id}" data-gender="Female" ${member.gender === 'Female' ? 'checked' : ''}>
        </td>
        <td>
          <input type="checkbox" data-id="${member._id}" data-field="firstService" ${todayRecord.firstService === 'Present' ? 'checked' : ''}>
        </td>
        <td>
          <input type="checkbox" data-id="${member._id}" data-field="secondService" ${todayRecord.secondService === 'Present' ? 'checked' : ''}>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    attachCheckboxListeners();
  } catch (error) {
    console.error('Error loading attendance:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="color:white; text-align:center;">
          ⚠️ Failed to load attendance
        </td>
      </tr>`;
  }
}

// Listen to checkbox changes and save status
function attachCheckboxListeners() {
  const checkboxes = tableBody.querySelectorAll('input[type="checkbox"]');

  checkboxes.forEach(cb => {
    cb.addEventListener('change', async (e) => {
      const memberId = e.target.dataset.id;
      const gender = e.target.dataset.gender;
      const field = e.target.dataset.field;
      const status = e.target.checked ? 'Present' : 'Absent';

      try {
        let payload = {};

        if (gender) {
          // Uncheck the other gender checkbox
          const row = e.target.closest('tr');
          const otherGenderCb = row.querySelector(`input[data-gender]:not([data-gender="${gender}"])`);
          if (otherGenderCb) otherGenderCb.checked = false;

          payload = { gender };
        } else if (field) {
          payload[field] = status;
        }

        const res = await fetch(`https://attendance-backend-ub0l.onrender.com/api/attendance/${memberId}/service`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update');

        // ✅ Success alerts
        if (gender) {
          alert("Gender saved!");
        } else if (field) {
          alert("Attendance updated!");
        }

      } catch (err) {
        console.error(err);
        e.target.checked = !e.target.checked; // revert if update fails
        alert('Failed to update, try again.');
      }
    });
  });
}

// Initial load
fetchAttendance();
