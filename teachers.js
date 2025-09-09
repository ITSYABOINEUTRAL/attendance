document.addEventListener("DOMContentLoaded", async () => {
  const tableContainer = document.getElementById("attendance-records");
  if (!tableContainer) return; // stop if container not found
  try {
    // Fetch data from backend
    const response = await fetch("https://attendance-backend-nt8h.onrender.com/api/attendance/all");
    if (!response.ok) throw new Error("Failed to fetch attendance data");

    const data = await response.json();
    const dates = data.dates;      // already sorted or as-is from backend
    const members = data.members;

    if (!members || members.length === 0) {
      tableContainer.innerHTML = "<p>No attendance records found.</p>";
      return;
    }

    // Build table header
    let tableHTML = `<table>
      <thead>
        <tr>
          <th>Name</th>`;
    dates.forEach(date => {
      const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });


      tableHTML += `<th>${formattedDate}</th>`;
    });
    tableHTML += `</tr></thead><tbody>`;

    // Build rows
    members.forEach(member => {
      tableHTML += `<tr><td>${member.name}</td>`;
      dates.forEach(date => {
        const status = member.attendance[date] || "—";
        tableHTML += `<td>${status}</td>`;
      });
      tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table>`;

    tableContainer.innerHTML = tableHTML;


  } catch (err) {
    console.error("Error loading teacher attendance:", err);
    tableContainer.innerHTML = "<p style='color:red; text-align:center;'>⚠️ Error loading attendance records.</p>";
  }
});
