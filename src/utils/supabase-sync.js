import { supabase } from './supabase'

// Sync user's company data to Supabase
export async function syncCompanyData(userId, company) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .upsert(
        { user_id: userId, ...company },
        { onConflict: 'user_id' }
      )
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (e) {
    console.error('Error syncing company:', e)
    return { error: e.message }
  }
}

// Sync clients
export async function syncClients(userId, clients) {
  try {
    // Delete existing clients for this user, then insert new ones
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('user_id', userId)

    if (deleteError) throw deleteError

    if (clients.length === 0) return { success: true }

    const clientsWithUserId = clients.map(c => ({
      ...c,
      user_id: userId,
      id: c.id.startsWith('imp-') || c.id.startsWith('c') ? c.id : `c_${c.id}`,
    }))

    const { data, error } = await supabase
      .from('clients')
      .insert(clientsWithUserId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (e) {
    console.error('Error syncing clients:', e)
    return { error: e.message }
  }
}

// Sync products
export async function syncProducts(userId, products) {
  try {
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('user_id', userId)

    if (deleteError) throw deleteError

    if (products.length === 0) return { success: true }

    const productsWithUserId = products.map(p => ({
      ...p,
      user_id: userId,
      id: p.id.startsWith('p') ? p.id : `p_${p.id}`,
    }))

    const { data, error } = await supabase
      .from('products')
      .insert(productsWithUserId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (e) {
    console.error('Error syncing products:', e)
    return { error: e.message }
  }
}

// Sync invoices (with lines)
export async function syncInvoices(userId, invoices) {
  try {
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('user_id', userId)

    if (deleteError) throw deleteError

    if (invoices.length === 0) return { success: true }

    // Insert invoices and their lines
    for (const invoice of invoices) {
      const invoiceData = {
        ...invoice,
        user_id: userId,
        client_id: invoice.clientId,
        due_date: invoice.dueDate,
        tipo_factura: invoice.tipoFactura,
        id: invoice.id.startsWith('inv') ? invoice.id : `inv_${invoice.id}`,
      }

      const { error: invError } = await supabase
        .from('invoices')
        .insert(invoiceData)

      if (invError) throw invError

      // Insert invoice lines
      if (invoice.lines && invoice.lines.length > 0) {
        const lines = invoice.lines.map(line => ({
          ...line,
          invoice_id: invoiceData.id,
          product_id: line.productId,
          unit_price: line.price || line.unitPrice,
          id: line.id.startsWith('l') ? line.id : `l_${line.id}`,
        }))

        const { error: lineError } = await supabase
          .from('invoice_lines')
          .insert(lines)

        if (lineError) throw lineError
      }
    }

    return { success: true }
  } catch (e) {
    console.error('Error syncing invoices:', e)
    return { error: e.message }
  }
}

// Sync quotes (with lines)
export async function syncQuotes(userId, quotes) {
  try {
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('user_id', userId)

    if (deleteError) throw deleteError

    if (quotes.length === 0) return { success: true }

    for (const quote of quotes) {
      const quoteData = {
        ...quote,
        user_id: userId,
        client_id: quote.clientId,
        valid_until: quote.validUntil,
        id: quote.id.startsWith('q') ? quote.id : `q_${quote.id}`,
      }

      const { error: qError } = await supabase
        .from('quotes')
        .insert(quoteData)

      if (qError) throw qError

      if (quote.lines && quote.lines.length > 0) {
        const lines = quote.lines.map(line => ({
          ...line,
          quote_id: quoteData.id,
          product_id: line.productId,
          unit_price: line.price || line.unitPrice,
          id: line.id.startsWith('l') ? line.id : `l_${line.id}`,
        }))

        const { error: lineError } = await supabase
          .from('quote_lines')
          .insert(lines)

        if (lineError) throw lineError
      }
    }

    return { success: true }
  } catch (e) {
    console.error('Error syncing quotes:', e)
    return { error: e.message }
  }
}

// Sync expenses
export async function syncExpenses(userId, expenses) {
  try {
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('user_id', userId)

    if (deleteError) throw deleteError

    if (expenses.length === 0) return { success: true }

    const expensesWithUserId = expenses.map(e => ({
      ...e,
      user_id: userId,
      id: e.id.startsWith('e') ? e.id : `e_${e.id}`,
    }))

    const { data, error } = await supabase
      .from('expenses')
      .insert(expensesWithUserId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (e) {
    console.error('Error syncing expenses:', e)
    return { error: e.message }
  }
}

// Fetch all user data from Supabase
export async function fetchUserData(userId) {
  try {
    const [companies, clients, products, invoices, quotes, expenses] = await Promise.all([
      supabase.from('companies').select('*').eq('user_id', userId).single(),
      supabase.from('clients').select('*').eq('user_id', userId),
      supabase.from('products').select('*').eq('user_id', userId),
      supabase.from('invoices').select('*, invoice_lines(*)').eq('user_id', userId),
      supabase.from('quotes').select('*, quote_lines(*)').eq('user_id', userId),
      supabase.from('expenses').select('*').eq('user_id', userId),
    ])

    return {
      company: companies.data,
      clients: clients.data || [],
      products: products.data || [],
      invoices: invoices.data || [],
      quotes: quotes.data || [],
      expenses: expenses.data || [],
    }
  } catch (e) {
    console.error('Error fetching user data:', e)
    return null
  }
}
