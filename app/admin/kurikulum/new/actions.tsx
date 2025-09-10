'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function uploadKurikulum(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
            console.log("Session error:", sessionError) 
        }
        
        const title = formData.get('title') as string
        const body = formData.get('body') as string
        
        if (!title || !body) {
            throw new Error("Title and Body are required")
        }

        // Get the highest order value from the table
        const { data: maxOrderData, error: maxOrderError } = await supabase
            .from('kurikulum')
            .select('order')
            .order('order', { ascending: false })
            .limit(1)
            .single()

        if (maxOrderError && maxOrderError.code !== 'PGRST116') {
            console.log("Error fetching max order:", maxOrderError)
            throw new Error('Failed to fetch max order value')
        }

        const nextOrder = maxOrderData ? (maxOrderData.order || 0) + 1 : 1

        // Insert with the calculated order
        const { data, error } = await supabase
            .from('kurikulum')
            .insert({ 
                title, 
                body, 
                order: nextOrder 
            })
            .select()

        if (error) {
            console.log("Insert error:", error)
            throw new Error('Failed to insert kurikulum')
        }

        revalidatePath('/admin/kurikulum')
        return data
    } catch (error) {
        console.error("Error in uploadKurikulum:", error)
        throw error
    }
}

export async function deleteKurikulum(formData: FormData) {
    try {
        const supabase = await createClient();
        const id = formData.get('id') as string
        
        if (!id) {
            throw new Error("ID is required")
        }

        // Get the order of the item being deleted for potential reordering
        const { data: deletedItem, error: fetchError } = await supabase
            .from('kurikulum')
            .select('order')
            .eq('id', id)
            .single()

        if (fetchError) {
            console.log("Error fetching item to delete:", fetchError)
            throw new Error('Failed to fetch item for deletion')
        }

        // Delete the item
        const { data, error } = await supabase
            .from('kurikulum')
            .delete()
            .eq('id', id)
            .select()

        if (error) {
            console.log("Delete error:", error)
            throw new Error('Failed to delete kurikulum')
        }

        if (deletedItem?.order) {
            const { error: reorderError } = await supabase
                .from('kurikulum')
                .update({ order: supabase.rpc('increment_order', { x: -1 }) })
                .gt('order', deletedItem.order)

            if (reorderError) {
                console.log("Reorder error (non-critical):", reorderError)
            }
        }

        revalidatePath('/admin/kurikulum')
        return data
    } catch (error) {
        console.error("Error in deleteKurikulum:", error)
        throw error
    }
}

export async function deleteKurikulumSimple(formData: FormData) {
    try {
        const supabase = await createClient();
        const id = formData.get('id') as string
        
        if (!id) {
            throw new Error("ID is required")
        }

        const { data, error } = await supabase
            .from('kurikulum')
            .delete()
            .eq('id', id)
            .select()

        if (error) {
            console.log("Delete error:", error)
            throw new Error('Failed to delete kurikulum')
        }

        revalidatePath('/admin/kurikulum')
        return data
    } catch (error) {
        console.error("Error in deleteKurikulum:", error)
        throw error
    }
}