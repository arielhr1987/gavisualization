import json
import os
import sys
import time

import numpy
from sklearn.manifold import TSNE, MDS, Isomap, LocallyLinearEmbedding, SpectralEmbedding

path = 'data'
methods = {
    'TSNE': TSNE,
    # 'MDS': MDS,
    # 'Isomap': Isomap,
    # 'SE': SpectralEmbedding,  # Hessian Eigenmapping
    # 'LLE': LocallyLinearEmbedding,
    # ------------------------------------------------------------------------------
    # 'MLLE': LocallyLinearEmbedding,  # (method = 'modified')
    # 'HE': LocallyLinearEmbedding,  # (method = 'hessian') # Hessian Eigenmapping
    # 'LTSA': LocallyLinearEmbedding  # method = 'ltsa' # Hessian Eigenmapping
}

method_param = {
    'MLLE': 'modified',
    'HE': 'hessian',
    'LTSA': 'ltsa'
}

perplexity = 30.0


# Disable
def block_print():
    sys.stdout = open(os.devnull, 'w')


# Restore
def enable_print():
    sys.stdout = sys.__stdout__


# This method applies the tsne method to every individual
# in the population to reduce it to a 2 and 3 dimension individual
def save(all, extra={}):
    for method in methods:
        extra['method'] = method
        save_data(all, extra)

    return


def save_data(all, extra):
    pop2d = list()
    pop3d = list()
    fitness = list();
    solution = extra['solution']
    print 'Reducing results for %s problem' % extra['problem']

    extra['fitness'] = collect_fitness(all)
    block_number = len(all)
    matrix = numpy.array(all)
    matrix = matrix.reshape((len(all) * len(all[0]), -1))
    matrix = numpy.append(matrix, [solution], 0)

    # gen2d = tsne(matrix, 2, extra['ind_size'], perplexity)

    # gen3d = tsne(matrix, 3, extra['ind_size'], perplexity)

    # manifold tsne
    method = extra['method']
    param = method_param.get(method)
    func = methods.get(method)
    model = {}
    if method == 'MLLE' or method == "HE" or method == "LTSA":
        model = func(n_components=2, method=param)
    elif method == "TSNE" or method == "MDS" or method == "Isomap" or method == "LLE" or method == "SE":
        model = func(n_components=2)

    # model = TSNE(n_components=2, random_state=0)
    gen2d = model.fit_transform(matrix)
    gen2d_solution = gen2d[-1].tolist()
    gen2d = gen2d[:-1]
    gen2d = numpy.vsplit(gen2d, block_number)

    for gen in gen2d:
        temp = gen.tolist()
        # temp.append(gen2d_solution)
        pop2d.append(temp)

    if method == 'MLLE' or method == "HE" or method == "LTSA":
        model = func(n_components=3, method=param)
    elif method == "TSNE" or method == "MDS" or method == "Isomap" or method == "LLE" or method == "SE":
        model = func(n_components=3)

    # model = func(n_components=3)

    gen3d = model.fit_transform(matrix)
    gen3d_solution = gen3d[-1].tolist()
    gen3d = gen3d[:-1]
    gen3d = numpy.vsplit(gen3d, block_number)

    for gen in gen3d:
        temp = gen.tolist()
        # temp.append(gen3d_solution)
        pop3d.append(temp)

    data = {
        '2d': {
            'data': pop2d,
            'solution': gen2d_solution
        },
        '3d': {
            'solution': gen3d_solution,
            'data': pop3d
        },
        'extra': extra
    }
    # saving the to json file
    print 'Saving data to file...'
    filename = '%s%s.json' % (extra['problem'], time.time())
    with open(os.path.join(path, filename), 'w') as file:
        json.dump(data, file)
    print 'Saved to %s' % os.path.join(path, filename)


def collect_fitness(all):
    fitness = list()
    for gen in all:
        fitness_gen = list()
        for ind in gen:
            fitness_gen.append(ind.fitness.values[0])
        fitness.append(fitness_gen)
    return fitness
