import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ApiService from '@/services/api-service';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '@/features/snackbar/snackbarSlice';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  targetDate: z.string().min(1),
  amount: z.coerce.number().min(1),
  contributors: z.string().optional() // comma-separated ids for simplicity
});

type FormValues = z.infer<typeof schema>;

export default function CreateMilestoneForm({ onCreated }: { onCreated: () => void }): JSX.Element {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const contributors = (values.contributors?.split(',').map(v => v.trim()).filter(Boolean)) ?? [];
      await ApiService.getInstance().createMilestone({
        title: values.title,
        description: values.description,
        targetDate: new Date(values.targetDate).toISOString(),
        amount: values.amount,
        contributors
      });
      dispatch(showSnackbar({ message: 'Milestone created', type: 'success' }));
      reset();
      onCreated();
    } catch (err) {
      dispatch(showSnackbar({ message: err instanceof Error ? err.message : 'Failed to create milestone', type: 'error' }));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Title</label>
        <input {...register('title')} className="input" placeholder="e.g., MVP Release" />
        {errors.title && <p className="text-sm text-rose-600 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="label">Description</label>
        <textarea {...register('description')} className="input" placeholder="What this milestone delivers" />
        {errors.description && <p className="text-sm text-rose-600 mt-1">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Target Date</label>
          <input type="date" {...register('targetDate')} className="input" />
          {errors.targetDate && <p className="text-sm text-rose-600 mt-1">{errors.targetDate.message}</p>}
        </div>
        <div>
          <label className="label">Bonus Amount</label>
          <input type="number" min={1} step="1" {...register('amount')} className="input" />
          {errors.amount && <p className="text-sm text-rose-600 mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="label">Contributor IDs (comma-separated)</label>
          <input {...register('contributors')} className="input" placeholder="e.g., c1,c2" />
        </div>
      </div>
      <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Milestone'}</button>
    </form>
  );
}
