import json
import os
import sys
from time import sleep

import numpy
import progressbar as pb

from tsne.tsne import tsne

path = 'data'
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
    pop2d = list()
    pop3d = list()
    solution = extra['solution']

    print 'Reducing results for %s problem' % extra['problem']

    bar = pb.ProgressBar(maxval=40, widgets=[pb.Bar('=', '[', ']'), ' ', pb.Percentage()], redirect_stdout=True)
    bar.start()
    i = 0
    for gen in all:
        # add solution to generation
        gen.append(solution)

        gen2d = numpy.array(gen)
        gen3d = numpy.array(gen)

        block_print()

        # reducing to 2D
        # gen2d = tsne(gen2d, 2, extra['ind_size'], perplexity)
        pop2d.append(gen2d.tolist())

        # reducing to 3D
        gen3d = tsne(gen3d, 3, extra['ind_size'], perplexity)
        pop3d.append(gen3d.tolist())

        enable_print()

        bar.update(int(40 * i / len(all)))  # extra['NGEN']
        i += 1
        sleep(.1)

    bar.finish()

    # solution = solution * extra['pop_size']

    data = {
        '2d': {
            # 'data': pop2d,
            'solution': ''  # tsne(numpy.array(solution), 2, extra['ind_size'], perplexity)
        },
        '3d': {
            'solution': '',
            'data': pop3d
        },
        'extra': extra
    }
    # saving the to json file

    print 'Saving data to file...'
    filename = extra['problem'] + '.json'
    with open(os.path.join(path, filename), 'w') as file:
        json.dump(data, file)
    print 'Saved to %s' % os.path.join(path, filename)
    return
