import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'price', 'duration'],
    });

    return res.json(plans);
  }

  async destroy(req, res) {
    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    await plan.destroy();

    return res.status(204).json();
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    const { id, title, duration, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const plan = await Plan.create(req.body);

    return res.json(plan);
  }

  async show(req, res) {
    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    return res.status(200).json(plan);
  }
}

export default new PlanController();
