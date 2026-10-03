async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/music/search?q=lofi%20study");
    const json = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(json));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
