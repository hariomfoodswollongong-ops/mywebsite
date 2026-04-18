export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/products.csv')
  let currentBrand = ''
  if (!res.ok) return []
  const text = await res.text()
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = values[i] ?? ''
    })
	
	if (!row.id) {
    currentBrand = row.name
    return null
  }
	const parsedPrice =
    parseFloat(row.price.replace(/[^0-9.]/g, '')) || 0
    return {
      id: row.id || String(Math.random()),
      name: row.name || '',
      price: parsedPrice,
      image: row.image ? `/images/${row.image}` : '/images/placeholder.png',
      description: row.description || '',
	  stock: parseInt(row.stock) || 0,
	  brand: currentBrand,
    }
  })
  .filter((p): p is Product => p != null)
}
