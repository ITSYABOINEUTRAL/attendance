document.addEventListener("DOMContentLoaded", async () => {
  const tableContainer = document.getElementById("attendance-records");
  const exportBtn = document.getElementById("export-btn");
  if (!tableContainer) return;

  try {
    // Fetch data from backend
    const response = await fetch("https://attendance-backend-nt8h.onrender.com/api/attendance/all");
    if (!response.ok) throw new Error("Failed to fetch attendance data");

    const data = await response.json();
    const dates = data.dates; // Dates from backend
    const members = data.members;

    if (!members || members.length === 0) {
      tableContainer.innerHTML = "<p style='text-align:center;'>No attendance records found.</p>";
      return;
    }

    // Filter: Hide records older than 2 months
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 2 months ago
    const filteredDates = dates.filter(date => new Date(date) >= cutoff);

    // Build table header
    let tableHTML = `<table id="attendance-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Gender</th>`;
    filteredDates.forEach(date => {
      const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      tableHTML += `<th>${formattedDate} <br> (First Service)</th>`;
      tableHTML += `<th>${formattedDate} <br> (Second Service)</th>`;
    });
    tableHTML += `</tr></thead><tbody>`;

    // Helper function for styling status
    const formatStatus = (status) => {
      if (status === "Present") {
        return `<span style="color:green;">✅ Present</span>`;
      } else if (status === "Absent") {
        return `<span style="color:red;">❌ Absent</span>`;
      } else {
        return `<span style="color:gray;">—</span>`;
      }
    };

    // Build rows
    members.forEach(member => {
      tableHTML += `<tr><td>${member.name}</td>`;
      tableHTML += `<td>${member.gender}</td>`;

      filteredDates.forEach(date => {
        const first = member.attendance?.[date]?.firstService || "—";
        const second = member.attendance?.[date]?.secondService || "—";
        tableHTML += `<td>${formatStatus(first)}</td><td>${formatStatus(second)}</td>`;
      });

      tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table>`;
    tableContainer.innerHTML = tableHTML;

    // Export button logic
    exportBtn.addEventListener("click", () => {
      const table = document.getElementById("attendance-table");
      const workbook = XLSX.utils.table_to_book(table, { sheet: "Attendance Records" });
      XLSX.writeFile(workbook, "Attendance_Records.xlsx");
    });

  } catch (err) {
    console.error("Error loading teacher attendance:", err);
    tableContainer.innerHTML = "<p style='color:red; text-align:center;'>⚠️ Error loading attendance records.</p>";
  }
});
